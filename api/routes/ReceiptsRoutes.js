const express = require("express");
const route = express.Router();

route.post("/uploadReceiptData", async(req, res) => {
    if (req.body) {
        res.send({ message: "File received by server" });

        return;
    }
    res.send({ message: "some error. file not properly send / size is 0" });
});

module.exports = route;