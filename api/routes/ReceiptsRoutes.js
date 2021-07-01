const express = require("express");
const route = express.Router();
const SO_dataDB = require("../model/solution_owner");
const receiptDB = require("../model/receipts_data");
const userDB = require("../model/user");
const generateReceipt = require("../Utilities/invoiceGenerator/genterateReceipt");

route.post("/uploadReceiptData", async(req, res) => {
    if (req.body) {
        await SO_dataDB.deleteMany({}, (err) => {
            if (err) {
                console.log(err);
            }
        });
        let so_data = new SO_dataDB({
            so_data: req.body.solutions_owner_data[0],
        });
        //save SO data to db
        so_data
            .save(so_data)
            .then(async(data) => {
                console.log("saved so_data", data);
            })
            .catch((err) => {
                res.status(500).send(err.message || "some error while sending to db");
            });

        //recepits data
        const cust_data = req.body.cust_data;
        const frim_data = req.body.solutions_owner_data[0];

        //loop thorught the rows and make recepit
        cust_data.forEach(async(element) => {
            try {
                const receipt_exists = await receiptDB.findOne({
                    invoice_num: element.invoice_num,
                });
                if (receipt_exists) {
                    console.log(
                        "a invoice with same number is present in db",
                        element.invoice_num
                    );
                } else {
                    await generateReceipt
                        .generateConfirmationInvoicePDF(element, frim_data)
                        .then(async(cloudinary_details) => {
                            console.log("result of generateing recipt", cloudinary_details);
                            const recepit = new receiptDB({
                                invoice_detials: element,
                                invoice_num: element.invoice_num,
                                receipt_url: cloudinary_details.secure_url,
                            });
                            console.log("saving invoice no.", element.invoice_num, "to db");
                            const result = await recepit.save();
                            //add recepit to user db
                            const user_found = await userDB.findOneAndUpdate({
                                email: element.cust_email,
                            }, { $push: { recepits: result._id } });
                            if (user_found)
                                console.log(
                                    "user found and added recepit to the user",
                                    user_found
                                );
                            else
                                console.log(
                                    "user with email id",
                                    element.cust_email,
                                    "not found"
                                );
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                }
            } catch (err) {
                console.log("err" + err);
            }
        });
        res.send({
            message: "Files have been uploaded",
        });
        return;
    }
    res.send({
        status: 400,
        message: "some error. file not properly send / size is 0",
    });
});

route.get("/userReceipts/:id", async(req, res) => {
    id = req.params.id;
    if (id) {
        const user = await userDB.findById(id);
        if (user.recepits.length) {
            const receiptsID_array = user.recepits;
            let array_of_receipts = [];
            receiptsID_array.forEach(async(receiptID) => {
                const receipt = await receiptDB.findById(receiptID);
                array_of_receipts.push(receipt);
            });
            res.send({ status: 200, user: user, receipts: array_of_receipts });
        } else {
            res.send({
                user: user,
                receipts: user.recepits,
                message: "User doesnt have any receipts",
            });
        }
        return;
    }
    res.status(400).send({ message: "Some issue with the suer id send" });
});

module.exports = route;