const nodemailer = require("nodemailer");

const mailWithAttachment = (to, attachment_url, subject, text, filename) => {
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
        text: text, // plain text body
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

module.exports = { mailWithAttachment };