const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"CrowdSourced Local Source" <${process.env.EMAIL_USER}>`, // ✅ Correct Format
            to: email,
            subject: "Your OTP for Verification",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">CrowdSourced Local Source</h2>
                    <p style="font-size: 16px; color: #555;">Welcome,</p>
                    <p style="font-size: 16px; color: #555;">Your OTP for verification is:</p>
                    <h3 style="text-align: center; background: #f4f4f4; padding: 10px; border-radius: 5px; font-size: 24px; color: #333;">
                        <b>${otp}</b>
                    </h3>
                    <p style="font-size: 16px; color: #555;">This OTP is valid for <b>10 minutes</b>. Please do not share it with anyone.</p>
                    <hr>
                    <p style="font-size: 14px; text-align: center; color: #888;">If you did not request this, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log("OTP Email sent successfully!");
    } catch (error) {
        console.error("Error sending OTP Email:", error);
    }
};

module.exports = sendEmail;
