const mongoose = require("mongoose");

var schme = new mongoose.Schema({
    name: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    isAdmin: { type: Boolean, default: false },
    approved: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    cust_id: { type: String, default: "" },
    cust_tax_id: { type: String, default: "" },
    cust_pan: { type: String, default: "" },
    cust_firm: { type: String, default: "" },
    cust_keyman: { type: String, default: "" },
    cust_email: { type: String, default: "" },
    cust_ph_isd: { type: String, default: "" },
    cust_ph_num: { type: String, default: "" },
    cucust_add_cntry: { type: String, default: "" },
    cust_add_zip: { type: String, default: "" },
    cust_add_state: { type: String, default: "" },
    cust_add_city: { type: String, default: "" },
    cust_add_landmark: { type: String, default: "" },
    cust_add_street: { type: String, default: "" },
    invoice_dt: { type: String, default: "" },
    invoice_num: { type: String, default: "" },
    invoice_dt: { type: String, default: "" },
    invoice_currency: { type: String, default: "" },
    invoice_amt: { type: String, default: "" },
    discount: { type: String, default: "" },
    email_dt: { type: String, default: "" },
    spl_message: { type: String, default: "" },
});

const userDB = mongoose.model("userDB", schme);

module.exports = userDB;