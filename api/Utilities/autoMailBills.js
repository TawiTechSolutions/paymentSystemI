const XLSX = require("xlsx");
const nodemailer = require("nodemailer");
const userDB = require("../model/user");
const billDB = require("../model/bill");

const checkDate = (date, recurring, frequency) => {
    let days = frequency == "Monthly" ? 30 : 7;
    let email_date = new Date(date);
    let now = new Date();
    if (email_date.getTime() <= now.getTime()) {
        if (email_date.toDateString() == now.toDateString()) {
            return true;
        }
        if (recurring == "Yes") {
            let i = 1;
            while (email_date.getTime() <= now.getTime()) {
                email_date.setDate(email_date.getDate() + days * i);
                if (email_date.toDateString() == now.toDateString()) {
                    return true;
                }
                i++;
            }
        }
    }
    return false;
};

const mailReceipts = async() => {
    userDB.find().then(async(users) => {
        users.forEach((user) => {
            if (user.bills.length > 0) {
                user.bills.forEach(async(bill_id) => {
                    let bill = await billDB.findById(bill_id);
                    if (
                        checkDate(
                            new Date(bill.email_dt).toDateString(),
                            bill.recurring,
                            bill.Frequency
                        )
                    ) {
                        //mail it
                        let transporter = nodemailer.createTransport({
                            service: "gmail",
                            auth: {
                                user: "usingfornodemailer@gmail.com",
                                pass: "nodemailer@1",
                            },
                        });
                        let mailOptions = {
                            from: "usingfornodemailer@gmail.com", // sender address
                            to: user.email, // list of receivers
                            subject: "Invoice", // Subject line
                            text: `please check the attached invoice`, // plain text body
                            attachments: [{
                                filename: "Invoice.pdf",
                                path: bill.bill_url,
                            }, ],
                        };
                        await transporter.sendMail(mailOptions, (err, info) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(info);
                            }
                        });
                    }
                });
            }
        });
    });
};

module.exports = { mailReceipts };