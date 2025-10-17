const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
    email: { type: String, required: false },
    contact: { type: String, required: false },

    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 } // OTP expires after 600 sec (10 min)
});

module.exports = mongoose.model("OTP", otpSchema);
