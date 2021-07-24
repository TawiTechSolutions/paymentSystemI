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
                console.log("saved so_data");
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
                                console.log("user found and added bill to the user");
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
                console.log("saved so_data");
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
                                console.log("user found and added recepit to the user");
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

route.get("/userBillsYTD/:id", async(req, res) => {
    const token = req.headers.token;
    let id = JWT.getUserData(token)._id;
    if (req.params.id !== ":id") {
        id = req.params.id;
    }
    if (token) {
        try {
            if (id) {
                console.log("inside id if");
                const user = await userDB.findById(id);
                if (user.bills.length) {
                    const billsID_array = user.bills;
                    let array_currency = [];
                    let dict_total = {};
                    for (let i = 0; i < billsID_array.length; i++) {
                        const bills = await billDB.findById(billsID_array[i]);
                        if (bills) {
                            let invoice_currency = bills.invoice_detials.invoice_currency;
                            if (!array_currency.includes(invoice_currency)) {
                                array_currency.push(invoice_currency);
                                dict_total[invoice_currency] = 0;
                            }
                            dict_total[invoice_currency] =
                                dict_total[invoice_currency] +
                                parseFloat(bills.invoice_detials.final_bal_due);
                        }
                    }

                    res.send({
                        status: 200,
                        user,
                        total: dict_total,
                        currencies: array_currency,
                        haveBills: true,
                    });
                } else {
                    res.send({
                        user: user,
                        haveBills: false,
                    });
                }

                return;
            }
        } catch (error) {
            console.log(error);
            res.send({ message: "Error with database" });
            return;
        }
    }

    res.status(400).send({ message: "Some issue with the request send" });
});

route.get("/userReceiptsYTD/:id", async(req, res) => {
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
                    const receiptID_array = user.recepits;
                    let array_currency = [];
                    let dict_total = {};
                    for (let i = 0; i < receiptID_array.length; i++) {
                        const receipt = await receiptDB.findById(receiptID_array[i]);
                        if (receipt) {
                            let invoice_currency = receipt.invoice_detials.invoice_currency;
                            if (!array_currency.includes(invoice_currency)) {
                                array_currency.push(invoice_currency);
                                dict_total[invoice_currency] = 0;
                            }
                            dict_total[invoice_currency] =
                                dict_total[invoice_currency] +
                                parseFloat(receipt.invoice_detials.final_bal_due);
                        }
                    }

                    res.send({
                        status: 200,
                        user,
                        total: dict_total,
                        currencies: array_currency,
                        haveReceipts: true,
                    });
                } else {
                    res.send({
                        user: user,
                        haveReceipts: false,
                    });
                }
                return;
            }
        } catch (error) {
            console.log(error);
            res.send({ message: "Error with database" });
            return;
        }
    }

    res.send({ message: "Some issue with the req send" });
});

const addUserIfAbsent = async(element) => {
    return new Promise(async(resolve) => {
        let user = element;
        const email = user.cust_email;
        const salt = await bcrypt.genSalt(10);
        const password = randomstring.generate(10);
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
                try {
                    mailHelper.sendAccountMade({
                        ...JSON.parse(JSON.stringify(data)),
                        host_url: process.env.HOST,
                        random_string: password,
                    });
                    resolve(true);
                } catch (err) {
                    resolve(err);
                }
            })
            .catch((err) => {
                console.log(err);
                resolve(err);
                return;
            });
    });
};

module.exports = route;