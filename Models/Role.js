//const { required } = require("joi");
const { types, required } = require("joi");
const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
    roleName: {
        type: String,
        required: true,
        unique: true
    },
    permissions: {
        type: [String],
        //default: []
        required: true
    }
});

const Role = mongoose.model("role", roleSchema);

module.exports = Role;