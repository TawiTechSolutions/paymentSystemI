var fs = require("fs");
var pdf = require("html-pdf");
var ejs = require("ejs");
const { resolve } = require("path");

const generateConfirmationInvoicePDF = (clientData, firmData) => {
    return new Promise((resolve) => {
        fs.readFile(
            "../Utilities/invoiceGenerator/invoice.ejs",
            "utf8",
            async(err, file) => {
                if (err) {
                    console.log(err);
                    resolve(false);
                }
                const ejs_string = file;
                let template = ejs.compile(ejs_string);

                let html = template({
                    clientData: clientData,
                    firmData: firmData,
                });
                console.log("making invoice for", clientData.invoice_num);
                const result = await htmlTpPdf(
                    html,
                    "public/PDFs/ConfrimationInvoice/" + clientData.invoice_num + ".pdf"
                );
                resolve(result);
            }
        );
    });
};

const htmlTpPdf = (html, pdfPath) => {
    return new Promise(async(resolve) => {
        var options = {
            format: "A4",
        };
        pdf.create(html, options).toFile(pdfPath, function(err, res) {
            if (err) {
                console.log(err);
                resolve(false);
            }
            console.log(res);
            resolve(true);
        });
    });
};

module.exports = {
    generateConfirmationInvoicePDF,
};