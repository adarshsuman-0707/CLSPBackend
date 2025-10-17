const nodemailer = require("nodemailer");
require("dotenv").config();

const sendBookingStatusEmail = async (email, bookingStatus, serviceName, bookingDate) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"CrowdSourced Local Source" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Your Booking Status: ${bookingStatus}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">CrowdSourced Local Source</h2>
                    <p style="font-size: 16px; color: #555;">Hello,</p>
                    <p style="font-size: 16px; color: #555;">
                        Your booking for <b>${serviceName}</b> on <b>${bookingDate}</b> has been:
                    </p>
                    <h3 style="text-align: center; padding: 10px; border-radius: 5px; font-size: 24px; color: ${
                        bookingStatus.toLowerCase() === 'accepted' ? 'green' : 'red'
                    }; background: #f4f4f4;">
                        <b>${bookingStatus.toUpperCase()}</b>
                    </h3>
                    <p style="font-size: 16px; color: #555;">Thank you for using our service.</p>
                    <hr>
                    <p style="font-size: 14px; text-align: center; color: #888;">
                        If you did not request this, please ignore this email.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log("Booking status email sent successfully!");
    } catch (error) {
        console.error("Error sending booking status email:", error);
    }
};

module.exports = sendBookingStatusEmail;
