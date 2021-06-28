const mongoose = require("mongoose");

var schme = new mongoose.Schema({
    so_data: {
        so_keyman: { type: String, default: "" },
        so_keyman_title: { type: String, default: "" },
        so_email: { type: String, default: "" },
        so_position: { type: String, default: "" },
        so_ph_isd: { type: String, default: "" },
        so_ph_num: { type: String, default: "" },
        so_add_cntry: { type: String, default: "" },
        so_add_zip: { type: String, default: "" },
        so_add_state: { type: String, default: "" },
        so_add_city: { type: String, default: "" },
        so_add_landmark: { type: String, default: "" },
        so_add_street: { type: String, default: "" },
        so_firm: { type: String, default: "" },
        so_firm_email: { type: String, default: "" },
        so_firm_acc_name: { type: String, default: "" },
        so_firm_acc_num: { type: String, default: "" },
        so_firm_ifsc: { type: String, default: "" },
        so_firm_swift: { type: String, default: "" },
        so_firm_ph_isd: { type: String, default: "" },
        so_firm_ph_num: { type: String, default: "" },
        so_firm_add_cntry: { type: String, default: "" },
        so_firm_add_zip: { type: String, default: "" },
        so_firm_add_state: { type: String, default: "" },
        so_firm_add_city: { type: String, default: "" },
        so_firm_add_landmark: { type: String, default: "" },
        so_firm_add_street: { type: String, default: "" },
    },
});

const SO_data = mongoose.model("SO_data", schme);

module.exports = SO_data;