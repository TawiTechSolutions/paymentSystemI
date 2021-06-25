const XLSX = require("xlsx");
const generateInvoice = require("./invoiceGenerator/htmlToPdf");

const wait = () => {
    var now = new Date();
    var waitFor =
        new Date(now.getFullYear(), now.getMonth(), now.getDate(), 07, 00, 0, 0) -
        now;
    console.log(waitFor);
    if (waitFor < 0) {
        waitFor += 86400000;
    }
    setTimeout(function() {
        mailReceipts();
        wait();
    }, waitFor);
};

const mailReceipts = () => {
    const sheets = parseExcel("../local_temp_storage/receipt_data/receipt.xlsx");
    // for (let i = 0; i < sheets.cust_data.length; i++) {
    //     generateInvoice.generateConfirmationInvoicePDF(
    //         sheets.cust_data[i],
    //         sheets.solutions_owner_data[0]
    //     );
    // }
    console.log(sheets.cust_data[0]);
    generateInvoice.generateConfirmationInvoicePDF(
        sheets.cust_data[0],
        sheets.solutions_owner_data[0]
    );
};

const parseExcel = (filePath) => {
    const workbook = XLSX.readFile(filePath, {
        type: "binary",
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

mailReceipts();