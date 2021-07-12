const express = require("express");
const route = express.Router();
const shortid = require("shortid");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const billDB = require("../model/bill");

const razorpay = new Razorpay({
    key_id: "rzp_test_iyc6McBDRDGLBz",
    key_secret: "s7P0pAd97rBttaL38xysLr3s",
});

route.post("/verification", (req, res) => {
    // do a validation
    const secret = "12345678";

    console.log(req.body);

    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    console.log(digest, req.headers["x-razorpay-signature"]);

    if (digest === req.headers["x-razorpay-signature"]) {
        console.log("request is legit");
        // process it
        require("fs").writeFileSync(
            "payment1.json",
            JSON.stringify(req.body, null, 4)
        );
    } else {
        // pass it
    }
    res.send({ status: "ok" });
});

route.get("/razorpay/:id", async(req, res) => {
    const id = req.params.id;
    const payment_capture = 1;
    const currency = "INR";

    const bill_details = await billDB.findById(id);

    console.log("bill data", bill_details);

    if (bill_details) {
        const options = {
            amount: bill_details.invoice_detials.final_bal_due * 100,
            currency,
            receipt: shortid.generate(),
            payment_capture,
        };

        try {
            const response = await razorpay.orders.create(options);
            console.log(response);
            res.send({
                id: response.id,
                currency: response.currency,
                amount: response.amount,
            });
        } catch (error) {
            console.log(error);
        }
    } else {
        res.status(500).send({
            message: "error with database. cant find bill in db",
        });
    }
});

module.exports = route;