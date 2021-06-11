const mongoose = require("mongoose");

var schme = new mongoose.Schema({
    name: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    isAdmin: { type: Boolean, default: false },
    approved: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
});

const userDB = mongoose.model("userDB", schme);

module.exports = userDB;