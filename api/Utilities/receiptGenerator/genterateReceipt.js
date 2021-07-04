const fs = require("fs");
const pdf = require("html-pdf");
const ejs = require("ejs");
const cloudinary = require("cloudinary");
//let streamifier = require("streamifier");

cloudinary.config({
    cloud_name: "hibyehibye",
    api_key: "433544711529411",
    api_secret: "d7QnLYuJ0BfYA-WuAwrxrrO2hLk",
});

const generateConfirmationInvoicePDF = (clientData, firmData) => {
    return new Promise((resolve, reject) => {
        fs.readFile(
            "Utilities/receiptGenerator/receipt.ejs",
            "utf8",
            async(err, file) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                const ejs_string = file;
                let template = ejs.compile(ejs_string);
                let clientData_M = clientData;
                clientData_M.invoice_dt = new Date(
                    clientData.invoice_dt
                ).toDateString();

                let html = template({
                    clientData: clientData_M,
                    firmData: firmData,
                });
                console.log("making receipt for", clientData.invoice_num);
                await htmlToPdf(html)
                    .then((result) => {
                        resolve(result);
                    })
                    .catch((err) => {
                        console.log(err);
                        reject(err);
                    });
            }
        );
    });
};

const htmlToPdf = (html) => {
    return new Promise(async(resolve, reject) => {
        const options = {
            format: "A4",
        };
        pdf.create(html, options).toStream(function(err, stream) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                //uploading file to cloudinary
                let cld_upload_stream = cloudinary.v2.uploader.upload_stream({
                        folder: "PDFs",
                    },
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                stream.pipe(cld_upload_stream);
            }
        });
    });
};

module.exports = {
    generateConfirmationInvoicePDF,
};