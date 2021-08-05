const fs = require("fs");
const pdf = require("html-pdf");
const ejs = require("ejs");
const cloudinary = require("cloudinary");
//let streamifier = require("streamifier");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const path = require("path");
const libre = require("libreoffice-convert");

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

// // The error object contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
// function replaceErrors(key, value) {
//     if (value instanceof Error) {
//         return Object.getOwnPropertyNames(value).reduce(function(error, key) {
//             error[key] = value[key];
//             return error;
//         }, {});
//     }
//     return value;
// }

// function errorHandler(error) {
//     console.log(JSON.stringify({ error: error }, replaceErrors));

//     if (error.properties && error.properties.errors instanceof Array) {
//         const errorMessages = error.properties.errors
//             .map(function(error) {
//                 return error.properties.explanation;
//             })
//             .join("\n");
//         console.log("errorMessages in filling template", errorMessages);
//         // errorMessages is a humanly readable message looking like this:
//         // 'The tag beginning with "foobar" is unopened'
//     }
//     throw error;
// }

// const generateReceiptPDF = (data) => {
//     // Load the docx file as binary content
//     return new Promise((resolve) => {
//         const content = fs.readFileSync(
//             path.resolve(__dirname, "receiptTemplate.docx"),
//             "binary"
//         );

//         let zip = new PizZip(content);
//         let doc;
//         try {
//             doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
//         } catch (error) {
//             // Catch compilation errors (errors caused by the compilation of the template: misplaced tags)
//             errorHandler(error);
//             resolve(false);
//         }

//         //set the templateVariables
//         doc.setData(data);

//         try {
//             // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
//             doc.render();
//         } catch (error) {
//             // Catch rendering errors (errors relating to the rendering of the template: angularParser throws an error)
//             errorHandler(error);
//             resolve(false);
//         }

//         const buf = doc.getZip().generate({ type: "nodebuffer" });

//         const timeMili = Date.now();
//         const filename = `${data.cust_email}${timeMili}output.docx`;
//         const docxOutPutPath = path.resolve(__dirname, filename);
//         const pdfOutPath = path.resolve(
//             __dirname,
//             `${data.cust_email}${timeMili}output.pdf`
//         );

//         // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
//         fs.writeFileSync(docxOutPutPath, buf);
//         const file = fs.readFileSync(docxOutPutPath);
//         const extend = ".pdf";
//         const outputPath = path.join(__dirname, `./receiptTemplate${extend}`);
//         // Convert it to pdf format with undefined filter (see Libreoffice doc about filter)
//         libre.convert(file, extend, undefined, (err, done) => {
//             if (err) {
//                 console.log(`Error converting file: ${err}`);
//             }

//             // Here in done you have pdf file which you can save or transfer in another stream
//             fs.writeFileSync(outputPath, done);
//             fs.unlinkSync(docxOutPutPath);
//         });

// cloudinary.v2.uploader.upload(
//                     pdfOutPath, {
//                         folder: "PDFs",
//                         format: "pdf",
//                     },
//                     (error, result) => {
//                         fs.unlinkSync(pdfOutPath);
//                         if (result) {
//                             resolve(result);
//                         } else {
//                             console.log(error);
//                             resolve(false);
//                         }
//                     }
//                 );
//resolve(path.resolve(__dirname, `${data._id}output.docx`));
//     });
// };

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
            //format: "A4",
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