const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 5,
        max: 50,
    },
    email: {
        type: String,
        required: true,
        max: 255,
        min: 6
    },
    password: {
        required: true,
        max: 1024,
        min: 10,
        type: String
    },
    date: {
        type: Date,
        default: Date.now,
    },
    permissions: {
        required: false,
        type: Array,
        default: []
    }
});

module.exports = mongoose.model("User", userSchema);