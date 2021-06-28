const mongoose = require("mongoose");

var schme = new mongoose.Schema({
    invoice_detials: {
        invoice_dt: { type: String, default: "" },
        invoice_num: { type: String, default: "" },
        invoice_dt: { type: String, default: "" },
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
        shown_in_System: { type: String, default: "" },
        payment_date: { type: String, default: "" },
        payment_amt: { type: String, default: "" },
    },
    recepit_id: {
        type: String,
        require: true,
        unique: true,
    },
});

const Recepits = mongoose.model("recepits", schme);

module.exports = Recepits;