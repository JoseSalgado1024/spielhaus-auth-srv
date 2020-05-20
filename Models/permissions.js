const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
    namespace: {
        type: String,
        required: true,
        min: 4,
        max: 40,
    },
    action: {
        type: String,
        required: true,
        max: 40,
        min: 4
    },
    description: {
        required: false,
        max: 256,
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now,
    }
});


module.exports = mongoose.model("Permission", permissionSchema);