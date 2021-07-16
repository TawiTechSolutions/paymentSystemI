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

const addCommas = (e) => {
    let l,
        t,
        n = (e = e.toString()).indexOf(".");
    if (
        (n >= 0 ? ((l = e.slice(0, n)), (t = e.slice(n))) : ((l = e), (t = "")),
            l.length > 3)
    ) {
        let e = l.slice(0, l.length - 3) + "," + l.slice(l.length - 3);
        for (let l = 2; e.length - 4 - l > 0; l += 3)
            e = e.slice(0, e.length - 4 - l) + "," + e.slice(e.length - 4 - l);
        return e + t;
    }
    return e;
};

const generateReceiptPDF = (clientData, firmData) => {
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
                    addCommas: addCommas,
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
            timeout: "100000",
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
    generateReceiptPDF,
};