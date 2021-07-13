const express = require("express");
const route = express.Router();
const generateReceipt = require("../Utilities/receiptGenerator/genterateReceipt");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const billDB = require("../model/bill");
const SO_dataDB = require("../model/solution_owner");
const userDB = require("../model/user");

const razorpay = new Razorpay({
    key_id: "rzp_test_iyc6McBDRDGLBz",
    key_secret: "s7P0pAd97rBttaL38xysLr3s",
});

route.post("/verification", async(req, res) => {
    // do a validation
    const secret = process.env.RAZORPAY_VERIFICATION_SECRET;

    console.log("data given by webhook of razorPay", req.body);

    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest === req.headers["x-razorpay-signature"]) {
        console.log("payment has been made and captured");
        // process it
        require("fs").writeFileSync(
            "payment1.json",
            JSON.stringify(req.body, null, 4)
        );
        //delete bill
        const bill_details = await billDB.findOneAndDelete({
            order_id: req.body.payload.payment.entity.order_id,
        });
        //mail receipt
        const SO_details = await SO_dataDB.find();
        console.log("inside verfification", SO_details[0]);

        const user = await userDB.findById(bill_details.user_id);

        let cust_data = {...user, ...bill_details.invoice_detials };

        console.log("cust_data", cust_data);

        // await generateReceipt
        //     .generateReceiptPDF(cust_data[i], SO_details[0])
        //     .then(async(cloudinary_details) => {
        //         console.log("result of generateing recipt", cloudinary_details);
        //         const recepit = new receiptDB({
        //             invoice_detials: cust_data[i],
        //             invoice_num: cust_data[i].invoice_num,
        //             receipt_url: cloudinary_details.secure_url,
        //         });
        //         console.log("saving receipt no.", cust_data[i].invoice_num, "to db");
        //         const result = await recepit.save();
        //         //add recepit to user db
        //         const user_found = await userDB.findOneAndUpdate({
        //             email: cust_data[i].cust_email,
        //         }, { $push: { recepits: result._id } });
        //         if (user_found)
        //             console.log("user found and added recepit to the user", user_found);
        //         else {
        //             console.log(
        //                 "user with email id",
        //                 cust_data[i].cust_email,
        //                 "not found"
        //             );
        //             ///adding new user
        //             await addUserIfAbsent(cust_data[i]);
        //             console.log("added user with email", cust_data[i].cust_email);
        //             await userDB.findOneAndUpdate({
        //                 email: cust_data[i].cust_email,
        //             }, { $push: { recepits: result._id } });
        //         }
        //         //mail the receipt
        //         let transporter = nodemailer.createTransport({
        //             service: "gmail",
        //             auth: {
        //                 user: process.env.SENDER_EMAIL,
        //                 pass: process.env.SENDER_EMAIL_PASSWORD,
        //             },
        //         });
        //         let mailOptions = {
        //             from: process.env.SENDER_EMAIL, // sender address
        //             to: cust_data[i].cust_email, // list of receivers
        //             subject: "Receipt", // Subject line
        //             text: `please check the attached Receipt`, // plain text body
        //             attachments: [{
        //                 filename: "Receipt.pdf",
        //                 path: cloudinary_details.secure_url,
        //             }, ],
        //         };
        //         await transporter.sendMail(mailOptions, (err, info) => {
        //             if (err) {
        //                 console.log(err);
        //             } else {
        //                 console.log(info);
        //             }
        //         });
        //     })
        //     .catch((err) => {
        //         console.log(err);
        //     });
    } else {
        // pass it
    }
    res.send({ status: "ok" });
});

route.get("/razorpay/:id", async(req, res) => {
    const id = req.params.id;
    const payment_capture = 1;
    const currency = "INR";

    const bill_details = await billDB.findById(id);

    console.log("bill data", bill_details);

    if (bill_details) {
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
                await billDB.findByIdAndUpdate(id, { order_id: response.id });
            } catch (err) {
                console.log("error in updating bill with order no", err);
            }

            res.send({
                id: response.id,
                currency: response.currency,
                amount: response.amount,
            });
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