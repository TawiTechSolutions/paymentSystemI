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
            "Utilities/invoiceGenerator/invoice.ejs",
            "utf8",
            async(err, file) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                const ejs_string = file;
                let template = ejs.compile(ejs_string);

                let html = template({
                    clientData: clientData,
                    firmData: firmData,
                });
                console.log("making invoice for", clientData.invoice_num);
                htmlToPdf(html)
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