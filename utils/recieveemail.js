const nodemailer = require("nodemailer");
require("dotenv").config();

const receiveEmail = async (data) => {
  try {
    const { name, email, subject, message } = data;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${name}" <${email}>`, // sender (user who filled contact form)
      to: process.env.EMAIL_USER,   // your email (where you’ll receive it)
      subject: `New Contact Message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">📩 New Message Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
            ${message}
          </div>
          <hr>
          <p style="text-align: center; font-size: 13px; color: #888;">
            This message was sent from your website contact form.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Contact form email sent successfully!");
    return { success: true, message: "Email sent successfully!" };

  } catch (error) {
    console.error("Error sending contact email:", error);
    return { success: false, error: "Failed to send email" };
  }
};

module.exports = receiveEmail;
