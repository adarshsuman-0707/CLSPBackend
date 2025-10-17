const otpGenerator = require("otp-generator");

const generateOtp = () => {
    return otpGenerator.generate(6, { upperCase: false, specialChars: false });
};

module.exports = generateOtp;
