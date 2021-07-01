const XLSX = require("xlsx");
const generateInvoice = require("./invoiceGenerator/genterateReceipt");
const nodemailer = require("nodemailer");

const wait = () => {
    var now = new Date();
    var waitFor =
        new Date(now.getFullYear(), now.getMonth(), now.getDate(), 07, 00, 0, 0) -
        now;
    if (waitFor < 0) {
        waitFor += 86400000;
    }
    console.log("waiting to mail for (mili seconds)", waitFor);
    setTimeout(function() {
        mailReceipts();
        wait();
    }, waitFor);
};

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
    const sheets = parseExcel("../local_temp_storage/receipt_data/receipt.xlsx");
    for (let i = 0; i < sheets.cust_data.length; i++) {
        if (
            checkDate(
                new Date(sheets.cust_data[i].email_dt).toDateString(),
                sheets.cust_data[i].recurring,
                sheets.cust_data[i].Frequency
            )
        ) {
            generateInvoice.generateConfirmationInvoicePDF(
                sheets.cust_data[i],
                sheets.solutions_owner_data[0]
            );
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
                to: sheets.cust_data[i].cust_email, // list of receivers
                subject: "Invoice", // Subject line
                text: `please check the attached invoice`, // plain text body
                attachments: [{
                    path: "public/PDFs/ConfrimationInvoice/" +
                        sheets.cust_data[i].invoice_num +
                        ".pdf",
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
    }
};

const parseExcel = (filePath) => {
    const workbook = XLSX.readFile(filePath, {
        type: "binary",
        cellDates: true,
        cellNF: false,
        cellText: false,
    });
    let data = {};
    workbook.SheetNames.forEach(function(sheetName) {
        const XL_row_object = XLSX.utils.sheet_to_row_object_array(
            workbook.Sheets[sheetName]
        );
        data[sheetName] = XL_row_object;
    });
    return data;
};

module.exports = { wait };