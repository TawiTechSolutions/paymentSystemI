const mongoose = require("mongoose");

var invoice_detials = new mongoose.Schema({
    invoice_dt: { type: String, default: "" },
    invoice_num: { type: String, default: "" },
    invoice_currency: { type: String, default: "" },
    invoice_amt: { type: String, default: "" },
    discount: { type: String, default: "" },
    email_dt: { type: String, default: "" },
    desc: { type: String, default: "" },
    TDS: { type: String, default: "" },
    GST: { type: String, default: "" },
    final_bal_due: { type: String, default: "" },
    recurring: { type: String, default: "" },
    Frequency: { type: String, default: "" },
    paid: { type: String, default: "" },
    payment_method: { type: String, default: "" },
    shown_in_system: { type: String, default: "" },
    payment_date: { type: String, default: "" },
    payment_amt: { type: String, default: "" },
});

var schme = new mongoose.Schema({
    invoice_detials: {
        type: invoice_detials,
        require: true,
    },
    invoice_num: { type: String, require: true, unique: true },
    receipt_url: { type: String, default: "" },
});

const Recepits = mongoose.model("recepits", schme);

module.exports = Recepits;