const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");

const mailWithAttachment = async(
    to,
    bcc,
    subject,
    html,
    filename,
    attachment_url
) => {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_EMAIL_PASSWORD,
        },
    });
    let mailOptions = {
        from: process.env.SENDER_EMAIL, // sender address
        to: to, // list of receivers
        bcc: bcc,
        subject: subject, // Subject line

        html: html, // plain text body
        attachments: [{
            filename: filename,
            path: attachment_url,
        }, ],
    };
    await transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log(info);
        }
    });
};

const mail = async(to, subject, html) => {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_EMAIL_PASSWORD,
        },
    });
    let mailOptions = {
        from: process.env.SENDER_EMAIL, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line

        html: html, // plain text body
    };
    await transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log(info);
        }
    });
};

//send a receipt email
const sendReceipt = (data, receipt_url, bcc) => {
    const source = fs
        .readFileSync("Utilities/emails/emailTemplates/receipt.html", "utf-8")
        .toString();
    const template = handlebars.compile(source);
    const htmlToSend = template(data);
    mailWithAttachment(
        data.email,
        bcc,
        `${data.invoice_currency}${data.invoice_amt}, invoice #: ${invoice_num}`,
        htmlToSend,
        "Receipt.pdf",
        receipt_url
    );
};

const sendInvoice = (data, invoice_url, bcc) => {
    const source = fs
        .readFileSync("Utilities/emails/emailTemplates/invoice.html", "utf-8")
        .toString();
    const template = handlebars.compile(source);
    const htmlToSend = template(data);
    mailWithAttachment(
        data.email,
        bcc,
        `Payment link for ${data.cust_firm} for invoice #:${data.invoice_num}`,
        htmlToSend,
        "Invoice.pdf",
        invoice_url
    );
};

const sendPaymentReminder = (data, invoice_url, bcc) => {
    const source = fs
        .readFileSync(
            "Utilities/emails/emailTemplates/paymentReminder.html",
            "utf-8"
        )
        .toString();
    const template = handlebars.compile(source);
    const htmlToSend = template(data);
    mailWithAttachment(
        data.email,
        bcc,
        `Payment link for ${data.cust_firm} for invoice #:${data.invoice_num}`,
        htmlToSend,
        "Invoice.pdf",
        invoice_url
    );
};

const sendVerification = (data) => {
    const source = fs
        .readFileSync("Utilities/emails/emailTemplates/verification.html", "utf-8")
        .toString();
    const template = handlebars.compile(source);
    const htmlToSend = template(data);
    mail(data.email, `Account Created`, htmlToSend);
};
const sendAccountMade = (data) => {
    const source = fs
        .readFileSync("Utilities/emails/emailTemplates/accountMade.html", "utf-8")
        .toString();
    const template = handlebars.compile(source);
    const htmlToSend = template(data);
    mail(data.email, `Account Created`, htmlToSend);
};
module.exports = {
    sendReceipt,
    sendInvoice,
    sendPaymentReminder,
    sendVerification,
    sendAccountMade,
};