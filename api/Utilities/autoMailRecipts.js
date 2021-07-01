const XLSX = require("xlsx");
const nodemailer = require("nodemailer");
const userDB = require("../model/user");
const receiptDB = require("../model/receipts_data");

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
            if (user.recepits.length > 0) {
                user.recepits.forEach(async(recepit_id) => {
                    let recepit = await receiptDB.findById(recepit_id);
                    if (
                        checkDate(
                            new Date(recepit.email_dt).toDateString(),
                            recepit.recurring,
                            recepit.Frequency
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
                                path: recepit.receipt_url,
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

// const parseExcel = (filePath) => {
//     const workbook = XLSX.readFile(filePath, {
//         type: "binary",
//         cellDates: true,
//         cellNF: false,
//         cellText: false,
//     });
//     let data = {};
//     workbook.SheetNames.forEach(function(sheetName) {
//         const XL_row_object = XLSX.utils.sheet_to_row_object_array(
//             workbook.Sheets[sheetName]
//         );
//         data[sheetName] = XL_row_object;
//     });
//     return data;
// };

module.exports = { mailReceipts };