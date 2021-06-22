const fs = require("fs");
const XLSX = require("xlsx");
const FileReader = require("filereader");

const wait = () => {
    var now = new Date();
    var waitFor =
        new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 32, 0, 0) -
        now;
    console.log(waitFor);
    if (waitFor < 0) {
        waitFor += 86400000; // it's after 10am, try 10am tomorrow.
    }
    setTimeout(function() {
        console.log("It's 10am!");
        wait();
    }, waitFor);
};

const mailReceipts = () => {
    const sheets = parseExcel("../local_temp_storage/receipt_data/receipt.xlsx");
};

parseExcel = function(filePath) {
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