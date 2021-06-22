const express = require("express");
const route = express.Router();
const multer = require("multer");
var path = require("path");

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./local_temp_storage/receipt_data");
    },
    filename: function(req, file, cb) {
        cb(null, "receipt" + path.extname(file.originalname)); //Appending extension
    },
});

var upload = multer({ storage: storage });

route.post("/uploadReceiptData", upload.single("file"), async(req, res) => {
    if (req.file) {
        res.send({ message: "File received by server" });
        return;
    }
    res.send({ message: "some error. file not properly send / size is 0" });
});

module.exports = route;