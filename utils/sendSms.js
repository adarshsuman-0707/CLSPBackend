require("dotenv").config();
const twilio = require('twilio');


const sendSms = async (phoneNumber,otp) => {
   try {
      const accountSid = process.env.TWILIO_SID// Your Account SID from Twilio Console
  const authToken = process.env.TWILIO_TOKEN;   // Your Auth Token from Twilio Console
  
  const client = new twilio(accountSid, authToken);
      // const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const formattedNumber = `+91${phoneNumber}`; // Assuming phoneNumber is a 10-digit number
      console.log("Sending OTP to:", formattedNumber); // Debugging
  
      const message = await client.messages.create({
        body: `Your OTP is ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
        to: formattedNumber
      });
  
      console.log("Message Sent Successfully:", message.sid);
      return message;
    } catch (error) {
      console.error("Twilio Error:", error);
    }
};


module.exports = sendSms;