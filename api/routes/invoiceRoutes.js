const express = require("express");
const route = express.Router();
const SO_dataDB = require("../model/solution_owner");
const receiptDB = require("../model/receipt");
const billDB = require("../model/bill");
const userDB = require("../model/user");
const generateReceipt = require("../Utilities/receiptGenerator/genterateReceipt");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");

route.post("/uploadInvoicesData", async(req, res) => {
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
            //making receipt
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
                            else {
                                console.log(
                                    "user with email id",
                                    element.cust_email,
                                    "not found"
                                );
                                ///adding new user
                                await addUserIfAbsent(element);
                                console.log("added user wiht email", element.cust_email);
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                }
            } catch (err) {
                console.log("err" + err);
            }
            if (element.paid == "No") {
                //making bill
                try {
                    const bill_exists = await billDB.findOne({
                        invoice_num: element.invoice_num,
                    });
                    if (bill_exists) {
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
                                else {
                                    console.log(
                                        "user with email id",
                                        element.cust_email,
                                        "not found"
                                    );
                                    ///adding new user
                                    await addUserIfAbsent(element);
                                    console.log("added user wiht email", element.cust_email);
                                }
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                    }
                } catch (err) {
                    console.log("err" + err);
                }
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
            for (let i = 0; i < receiptsID_array.length; i++) {
                const receipt = await receiptDB.findById(receiptsID_array[i]);
                array_of_receipts.push(receipt);
            }
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

const addUserIfAbsent = async(element) => {
    return new Promise((resolve) => {
        let user = element;
        const email = user.cust_email;
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(randomstring.generate(), salt);
        user.password = hashPassword;
        user.email = email;
        user.name = user.cust_keyman;
        user.verified = true;
        user.approved = true;

        user = new userDB(user);

        //save user to db

        user
            .save(user)
            .then(async(data) => {
                let transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: "usingfornodemailer@gmail.com",
                        pass: "nodemailer@1",
                    },
                });
                let mailOptions = {
                    from: "usingfornodemailer@gmail.com", // sender address
                    to: email, // list of receivers
                    subject: "Password reset", // Subject line

                    html: `<p >your account was created. ur password is ${hashPassword}. ur email is this email</p>`, // html body
                };
                await transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        console.log(err);
                        resolve(err);
                        return;
                    }
                    if (info) {
                        resolve(info);
                    }
                });
            })
            .catch((err) => {
                console.log(err);
                resolve(err);
                return;
            });
    });
};

module.exports = route;