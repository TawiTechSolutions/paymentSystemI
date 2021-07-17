const express = require("express");
const route = express.Router();
const generateReceipt = require("../Utilities/receiptGenerator/genterateReceipt");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const billDB = require("../model/bill");
const SO_dataDB = require("../model/solution_owner");
const userDB = require("../model/user");
const mailHelper = require("../Utilities/emails/emailHelper");

const razorpay = new Razorpay({
    key_id: "rzp_test_iyc6McBDRDGLBz",
    key_secret: "s7P0pAd97rBttaL38xysLr3s",
});

route.post("/verification", async(req, res) => {
    res.send({ status: "ok" });
    // do a validation
    const secret = process.env.RAZORPAY_VERIFICATION_SECRET;

    console.log("data given by webhook of razorPay", req.body);

    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest === req.headers["x-razorpay-signature"]) {
        console.log("payment has been made and captured");

        //find bill
        const bill_details = await billDB.findOneAndUpdate({
            order_id: req.body.payload.payment.entity.order_id,
        }, { invoice_paid: true });
        //mail receipt
        if (bill_details) {
            const user = await userDB.findByIdAndUpdate(bill_details.user_id, {
                $pull: { bills: bill_details._id },
            });
            let cust_data = {
                ...JSON.parse(JSON.stringify(user)),
                ...JSON.parse(JSON.stringify(bill_details)).invoice_detials,
            };
            const SO_details = await SO_dataDB.find();
            try {
                generateReceipt
                    .generateReceiptPDF(cust_data, SO_details[0].so_data)
                    .then(async(cloudinary_details) => {
                        console.log("result of generateing recipt", cloudinary_details);
                        const recepit = new receiptDB({
                            invoice_detials: cust_data,
                            invoice_num: cust_data.invoice_num,
                            receipt_url: cloudinary_details.secure_url,
                        });
                        console.log("saving receipt no.", cust_data.invoice_num, "to db");
                        const result = await recepit.save();
                        //add recepit to user db
                        const user_found = await userDB.findOneAndUpdate({
                            email: cust_data.email,
                        }, { $push: { recepits: result._id } });
                        if (user_found)
                            console.log(
                                "user found and added recepit to the user",
                                user_found
                            );
                        else {
                            console.log("user with email id", cust_data.email, "not found");
                        }
                        //mail the receipt
                        try {
                            mailHelper.sendReceipt({
                                    ...cust_data,
                                    ...JSON.parse(JSON.stringify(SO_details[0].so_data)),
                                },
                                cloudinary_details.secure_url,
                                SO_details[0].so_data.so_email
                            );
                        } catch (error) {
                            console.log(
                                "error when mailing receipt after bill payment",
                                error
                            );
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } catch (error) {
                console.log("error when making or mailing receipt", error);
            }
        }
    } else {
        // pass it
    }
});

route.get("/razorpay/:id", async(req, res) => {
    const id = req.params.id;
    const payment_capture = 1;

    const bill_details = await billDB.findById(id);

    if (bill_details) {
        const currency =
            bill_details.invoice_detials.invoice_currency === "₹" ?
            "INR" :
            bill_details.invoice_detials.invoice_currency;

        const options = {
            amount: bill_details.invoice_detials.final_bal_due * 100,
            currency,
            receipt: bill_details.invoice_num,
            payment_capture,
        };

        try {
            const response = await razorpay.orders.create(options);
            console.log(response);
            try {
                const updatedBill = await billDB.findByIdAndUpdate(id, {
                    order_id: response.id,
                });
                if (updatedBill) {
                    res.send({
                        id: response.id,
                        currency: response.currency,
                        amount: response.amount,
                    });
                } else {
                    res.status(400).send({
                        message: "error updating the database",
                    });
                }
            } catch (err) {
                console.log("error in updating bill with order no", err);
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        res.status(500).send({
            message: "error with database. cant find bill in db",
        });
    }
});

module.exports = route;