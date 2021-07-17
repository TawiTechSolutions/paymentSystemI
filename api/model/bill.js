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
    due_date: { type: String, default: "" },
    reminder_1: { type: String, default: "" },
    reminder_2: { type: String, default: "" },
    email_time: { type: String, default: "" },
});

var schme = new mongoose.Schema({
    invoice_detials: {
        type: invoice_detials,
        require: true,
    },
    invoice_num: { type: String, require: true, unique: true },
    invoice_paid: { type: Boolean, default: false },
    bill_url: { type: String, default: "" },
    order_id: { type: String },
    user_id: { type: String, default: "" },
});

const Bills = mongoose.model("Bills", schme);

module.exports = Bills;