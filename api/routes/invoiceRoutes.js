const express = require("express");
const route = express.Router();
const SO_dataDB = require("../model/solution_owner");
const receiptDB = require("../model/receipt");
const billDB = require("../model/bill");
const userDB = require("../model/user");
const generateReceipt = require("../Utilities/receiptGenerator/genterateReceipt");
const generateBill = require("../Utilities/billGenerator/genterateBill");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const JWT = require("../Utilities/JWT_Auth");
const mailHelper = require("../Utilities/emails/emailHelper");
const convertCurrency = require("nodejs-currency-converter");

route.post("/uploadBillsData", async(req, res) => {
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
                console.log("error in saving to db", err);
            });

        //bills data
        const cust_data = req.body.cust_data;
        const frim_data = req.body.solutions_owner_data[0];
        //send res
        res.send({
            message: "Files have been uploaded",
        });
        //loop thorught the rows and make bill
        for (let i = 0; i < cust_data.length; i++) {
            //making Bill
            try {
                const Bill_exists = await billDB.findOne({
                    invoice_num: cust_data[i].invoice_num,
                });
                if (Bill_exists) {
                    console.log(
                        "a Bill with same number is present in db",
                        cust_data[i].invoice_num
                    );
                } else {
                    await generateBill
                        .generateBillPDF(cust_data[i], frim_data)
                        .then(async(cloudinary_details) => {
                            console.log("result of generateing bill", cloudinary_details);
                            const bill = new billDB({
                                invoice_detials: cust_data[i],
                                invoice_num: cust_data[i].invoice_num,
                                bill_url: cloudinary_details.secure_url,
                            });
                            console.log("saving Bill no.", cust_data[i].invoice_num, "to db");
                            const result = await bill.save();
                            //add bill to user db
                            const user_found = await userDB.findOneAndUpdate({
                                email: cust_data[i].cust_email,
                            }, { $push: { bills: result._id } });
                            if (user_found) {
                                console.log(
                                    "user found and added bill to the user",
                                    user_found
                                );
                                await billDB.findByIdAndUpdate(result._id, {
                                    user_id: user_found._id,
                                });
                            } else {
                                console.log(
                                    "user with email id",
                                    cust_data[i].cust_email,
                                    "not found"
                                );
                                ///adding new user
                                await addUserIfAbsent(cust_data[i]);
                                console.log("added user with email", cust_data[i].cust_email);
                                const new_user = await userDB.findOneAndUpdate({
                                    email: cust_data[i].cust_email,
                                }, { $push: { recepits: result._id } });
                                await billDB.findByIdAndUpdate(result._id, {
                                    user_id: new_user._id,
                                });
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

        return;
    }
    res.send({
        status: 400,
        message: "some error. file not properly send / size is 0",
    });
});

route.post("/uploadReceiptsData", async(req, res) => {
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
        //send respose
        res.send({
            message: "Files have been uploaded",
        });
        //loop thorught the rows and make recepit
        for (let i = 0; i < cust_data.length; i++) {
            //making receipt and removing bill
            try {
                const receipt_exists = await receiptDB.findOne({
                    invoice_num: cust_data[i].invoice_num,
                });
                if (receipt_exists) {
                    console.log(
                        "a receipt with same number is present in db",
                        cust_data[i].invoice_num
                    );
                } else {
                    //update bill as paid
                    try {
                        const foundBill = await billDB.findOneAndUpdate({
                            invoice_num: cust_data[i].invoice_num,
                        }, { invoice_paid: true });
                        if (foundBill) {
                            console.log("removing bill from user");
                            //remove bill from user
                            await userDB.findOneAndUpdate({
                                email: cust_data[i].cust_email,
                            }, { $pull: { bills: foundBill._id } });
                        }
                    } catch (err) {
                        console.log("error while removing bill", err);
                    }
                    //generate receipt and mail it
                    await generateReceipt
                        .generateReceiptPDF(cust_data[i], frim_data)
                        .then(async(cloudinary_details) => {
                            console.log("result of generateing recipt", cloudinary_details);
                            const foundBill = await billDB.findOne({
                                invoice_num: cust_data[i].invoice_num,
                            });
                            const recepit = new receiptDB({
                                invoice_detials: cust_data[i],
                                invoice_num: cust_data[i].invoice_num,
                                receipt_url: cloudinary_details.secure_url,
                                bill_url: foundBill ? foundBill.bill_url : "",
                            });
                            console.log(
                                "saving receipt no.",
                                cust_data[i].invoice_num,
                                "to db"
                            );
                            const result = await recepit.save();
                            //add recepit to user db
                            const user_found = await userDB.findOneAndUpdate({
                                email: cust_data[i].cust_email,
                            }, { $push: { recepits: result._id } });
                            if (user_found)
                                console.log(
                                    "user found and added recepit to the user",
                                    user_found
                                );
                            else {
                                console.log(
                                    "user with email id",
                                    cust_data[i].cust_email,
                                    "not found"
                                );
                                ///adding new user
                                await addUserIfAbsent(cust_data[i]);
                                console.log("added user with email", cust_data[i].cust_email);
                                await userDB.findOneAndUpdate({
                                    email: cust_data[i].cust_email,
                                }, { $push: { recepits: result._id } });
                            }
                            //mail the receipt
                            mailHelper.sendReceipt({...cust_data[i], ...frim_data },
                                cloudinary_details.secure_url,
                                frim_data.so_email
                            );
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                }
            } catch (err) {
                console.log("err" + err);
            }
        }

        return;
    }
    res.send({
        status: 400,
        message: "some error. file not properly send / size is 0",
    });
});

route.post("/confrimReceiptsUpload", async(req, res) => {
    const cust_data = req.body.cust_data;
    let not_found = { emails: [], bills: [] };
    if (cust_data.length) {
        for (let i = 0; i < cust_data.length; i++) {
            //checking if user exists
            try {
                const foundEmail = await userDB.findOne({
                    email: cust_data[i].cust_email,
                });
                if (!foundEmail) {
                    not_found.emails.push(cust_data[i].cust_email);
                }
                const foundBill = await billDB.findOne({
                    invoice_num: cust_data[i].invoice_num,
                });
                if (!foundBill) {
                    not_found.bills.push(cust_data[i].invoice_num);
                }
            } catch (error) {
                console.log(error);
            }
        }
        if (not_found.bills !== [] || not_found.emails !== []) {
            res.send({ not_found: not_found, missing: true });
        } else {
            res.send({ missing: false });
        }
    } else {
        res.send("something wrong with the data send");
    }
});

route.get("/userBills/:id", async(req, res) => {
    const token = req.headers.token;
    let id = JWT.getUserData(token)._id;
    if (req.params.id !== ":id") {
        id = req.params.id;
    }
    if (token) {
        const id = JWT.getUserData(token)._id;
        try {
            if (id) {
                const user = await userDB.findById(id);
                if (user.bills.length) {
                    const billsID_array = user.bills;
                    let array_of_bills = [];
                    for (let i = 0; i < billsID_array.length; i++) {
                        const bills = await billDB.findById(billsID_array[i]);
                        if (bills) {
                            array_of_bills.push(bills);
                        }
                    }
                    res.send({
                        status: 200,
                        user: user,
                        bills: array_of_bills,
                        haveBills: true,
                    });
                } else {
                    res.send({
                        user: user,
                        bills: user.bills,
                        haveBills: false,
                    });
                }
                return;
            }
        } catch (error) {
            console.log(error);
            res.status(400).send({ message: "Error with database" });
            return;
        }
    }

    res.status(400).send({ message: "Some issue with the token send" });
});

route.get("/userBillsYTD/:id/:currency", async(req, res) => {
    const currency = req.params.currency;
    console.log("got request from", currency);
    const token = req.headers.token;
    let id = JWT.getUserData(token)._id;
    if (req.params.id !== ":id") {
        id = req.params.id;
    }
    if (token) {
        const id = JWT.getUserData(token)._id;
        try {
            if (id) {
                if (currency) {
                    const user = await userDB.findById(id);
                    if (user.bills.length) {
                        const billsID_array = user.bills;
                        let total = 0;
                        for (let i = 0; i < billsID_array.length; i++) {
                            const bills = await billDB.findById(billsID_array[i]);
                            if (bills) {
                                convertCurrency(
                                        parseFloat(bills.invoice_detials.final_bal_due),
                                        bills.invoice_detials.invoice_currency,
                                        currency,
                                        new Date(bills.invoice_detials.invoice_dt).toISOString()
                                    )
                                    .then((response) => {
                                        total = total + parseFloat(response);
                                    })
                                    .catch((err) => {
                                        res.send({
                                            message: "Some error during currecny conversion. YTD is not avalibale right now",
                                        });
                                        console.log(err);
                                    });
                            }
                        }
                        res.send({
                            status: 200,
                            user: user,
                            total: Math.round(total * 100) / 100,
                            haveBills: true,
                        });
                    } else {
                        res.send({
                            user: user,
                            total: 0,
                            haveBills: false,
                        });
                    }
                }
                return;
            }
        } catch (error) {
            console.log(error);
            res.status(400).send({ message: "Error with database" });
            return;
        }
    }

    res.status(400).send({ message: "Some issue with the request send" });
});

route.get("/userReceipts/:id", async(req, res) => {
    const token = req.headers.token;
    let id = JWT.getUserData(token)._id;
    if (req.params.id !== ":id") {
        id = req.params.id;
    }
    if (token) {
        try {
            if (id) {
                const user = await userDB.findById(id);
                if (user.recepits.length) {
                    const receiptsID_array = user.recepits;
                    let array_of_receipts = [];
                    for (let i = 0; i < receiptsID_array.length; i++) {
                        const receipt = await receiptDB.findById(receiptsID_array[i]);
                        if (receipt) {
                            array_of_receipts.push(receipt);
                        }
                    }
                    res.send({
                        status: 200,
                        user: user,
                        receipts: array_of_receipts,
                        haveReceipts: true,
                    });
                } else {
                    res.send({
                        user: user,
                        receipts: user.recepits,
                        haveReceipts: false,
                    });
                }
                return;
            }
        } catch (error) {
            console.log(error);
            res.status(400).send({ message: "Error with database" });
            return;
        }
    }

    res.status(400).send({ message: "Some issue with the token send" });
});

route.get("/userReceiptsYTD/:id/:currency", async(req, res) => {
    const currency = req.params.currency;
    console.log("got request from", currency);
    const token = req.headers.token;
    let id = JWT.getUserData(token)._id;
    if (req.params.id !== ":id") {
        id = req.params.id;
    }
    if (token) {
        try {
            if (id) {
                if (currency) {
                    const user = await userDB.findById(id);
                    if (user.recepits.length) {
                        const receiptsID_array = user.recepits;
                        let total = 0;
                        for (let i = 0; i < receiptsID_array.length; i++) {
                            const receipt = await receiptDB.findById(receiptsID_array[i]);

                            if (receipt) {
                                convertCurrency(
                                        parseFloat(receipt.invoice_detials.final_bal_due),
                                        receipt.invoice_detials.invoice_currency,
                                        currency,
                                        new Date(receipt.invoice_detials.invoice_dt).toISOString()
                                    )
                                    .then((response) => {
                                        total = total + parseFloat(response);
                                    })
                                    .catch((err) => {
                                        res.send({
                                            message: "Some error during currecny conversion. YTD is not avalibale right now",
                                        });
                                        console.log(err);
                                    });
                                try {
                                    total =
                                        total +
                                        Math.round(
                                            parseFloat(receipt.invoice_detials.final_bal_due) * 100
                                        ) /
                                        100;
                                } catch (error) {
                                    console.log(error);
                                }
                            }
                        }
                        res.send({
                            status: 200,
                            user: user,
                            total: Math.round(total * 100) / 100,
                            haveReceipts: true,
                        });
                    } else {
                        res.send({
                            user: user,
                            total: 0,
                            haveReceipts: false,
                        });
                    }
                    return;
                }
            }
        } catch (error) {
            console.log(error);
            res.status(400).send({ message: "Error with database" });
            return;
        }
    }

    res.status(400).send({ message: "Some issue with the token send" });
});

const addUserIfAbsent = async(element) => {
    return new Promise(async(resolve) => {
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
                    subject: "Account Created", // Subject line

                    html: `<p >Your account for ${process.env.HOST} was created . Your password is ${hashPassword}. </p><p >This was automatically created when the admin uploaded your data</p><p >If there has been a misunderstanding plesae ignore this mail </p>`, // html body
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