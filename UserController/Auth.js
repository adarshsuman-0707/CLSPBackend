const User = require("../models/User.js")
const Otp = require("../models/Otp.js")
const sendEmail=require('../utils/sendEmail.js')
const sendSms=require('../utils/sendSms.js')
const receiveEmail=require('../utils/recieveemail.js')

const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');
const generateToken = require("../utils/generateToken.js");
const generateOtp=require("../utils/generateOtp.js")
const Login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let userData = await User.findOne({ email });
        console.log(userData._id);
        if (!userData) {
            return res.status(202).send("No Data Found")
        }

        let comparePass = await bcrypt.compare(password, userData.password)
        console.log(comparePass);
        if (!comparePass) {
            return res.status(201).json({message:"please enter the correct the password "});
        }
        const token=await generateToken(userData)
       console.log(token);
        return res.status(200).json({message:"Login Succesfully",token,userData})
    } 
    catch (error) {
        res.status(500).send(error)
    }
}

// const Signup = async (req, res) => {

//     try {
//         let { username, email, contact, password, role } = req.body
//         if (!username || !email || !contact || !password) {
//             res.status(404).json({ message: "Field is empty" });
//         }
//         const newpass = await bcrypt.genSalt(10);
//         password = await bcrypt.hash(password, newpass)
      
//         const newuser = new User({ username, email, contact, password, role });

//         if (newuser) {
//             const Checkemail = await User.findOne({ email })

//             // console.log(Checkemail);
//             if (!Checkemail) {
//                 const otp = generateOtp();
//                 console.log(otp);
//                 const Otpsaver= new Otp({email,otp })
//                 await Otpsaver.save();
//               await   sendEmail(email, otp);

                
//                 await newuser.save();
//                 return res.status(201).json("Successfully accepted").success(true)
//             }
//             else {
//                 return res.status(303).json("USer Already Exist").success(false)
//             }
//         }
//         else {
//             return res.status(303).json("Not Accepted").success(false)
//         }
//     } catch (error) {
//         return res.status(501).json({ message: error }).success(false)

//     }
// }

// // 🔹 OTP Verification
// const verifyOtp = async (req, res) => {
//     const { email, otp } = req.body;

//     try {
//         const storedOtp = await Otp.findOne({ email });

//         if (!storedOtp) {
//             return res.status(400).json({ message: "OTP expired or invalid. Please request a new one." }).success(false);
//         }

//         if (storedOtp.otp !== otp) {
//             return res.status(400).json({ message: "Invalid OTP. Please try again." }).success(false);
//         }

//         // OTP is valid, mark user as verified
//         await User.findOneAndUpdate({ email }, { emailVerified: true });

//         // Remove OTP from database after verification
//         await Otp.deleteOne({ email });

//         res.json({ message: "Email verified successfully!" }).success(true);
//     } catch (error) {
//         res.status(500).json({ message: "Server error", error }).success(false);
//     }
// };







// const verifyPhone = async (req, res) => {
//     const { contact } = req.body;
//   try{

//     if (!contact) return res.status(400).json({ error: "Phone number is required" });
//     const otp = generateOtp();
//     console.log(otp);
//     const Otpsaver= new Otp({contact,otp })
//     await Otpsaver.save();
//     sendSms(contact,otp);

//     await User.findOneAndUpdate({ contact: contact }, {phoneVerified:true});

//     await Otp.deleteOne({ contact });

//     res.status(200).json({ message: "OTP sent successfully!" });

//   }
//   catch(e){
//     res.status(301).json({ message: "OTP Not sent successfully!" });

//   }
// };

const requestEmailOtp = async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }
        
        // Generate OTP & send email
        const otp = generateOtp();
        console.log("Generated Email OTP:", otp);
        
        await Otp.findOneAndUpdate(
            { email },
            { otp, createdAt: new Date() },
            { upsert: true, new: true }
        );
        
        await sendEmail(email, otp);
        return res.status(200).json({ message: "OTP sent to email!" });
        
    } catch (error) {
        return res.status(500).json({ message: "Error sending OTP", error });
    }
};
const requestPhoneOtp = async (req, res) => {
    const { contact } = req.body;
    try {
        if (!contact) {
            return res.status(400).json({ message: "Phone number is required" });
        }
        
        const otp = generateOtp();
        console.log("Generated Phone OTP:", otp);
        
        await Otp.findOneAndUpdate(
            { contact },
            { otp, createdAt: new Date() },
            { upsert: true, new: true }
        );
        
        await sendSms(contact, otp);
        return res.status(200).json({ message: "OTP sent to phone!" });

    } catch (error) {
        return res.status(500).json({ message: "Error sending OTP", error });
    }
};
const verifyEmailOtp = async (req, res) => {
    const { email, otp } = req.body;
    
    try {
        const storedOtp = await Otp.findOne({ email });
        
        if (!storedOtp || storedOtp.otp !== otp) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        
        await Otp.deleteOne({ email }); // OTP used, delete from DB
        
        return res.status(200).json({ message: "Email verified successfully!" });
        
    } catch (error) {
        return res.status(500).json({ message: "Server error", error });
    }
};
const verifyPhoneOtp = async (req, res) => {
    const { contact, otp } = req.body;
    
    try {
        const storedOtp = await Otp.findOne({ contact });
        
        if (!storedOtp || storedOtp.otp !== otp) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        await Otp.deleteOne({ contact }); // OTP used, delete from DB

        return res.status(200).json({ message: "Phone verified successfully!" });
        
    } catch (error) {
        return res.status(500).json({ message: "Server error", error });
    }
};
const Signup = async (req, res) => {
    try {
        console.log(req.body);
        const { username, email, contact, password, role, pincode, country, state, city, address, firstname, lastname, gender } = req.body;
    
      
    
        // Validate required fields
        if (!username || !email || !contact || !password || !role || !pincode || !country || !state || !city || !address || !firstname || !lastname || !gender) {
          return res.status(400).json({ message: "All fields are required" });
        }
    
        // Check if both email and phone are verified
        const emailOtpDoc = await Otp.findOne({ email });
        const phoneOtpDoc = await Otp.findOne({ contact });

        if (emailOtpDoc=="null" || phoneOtpDoc=="null") {
          return res.status(400).json({ message: "Please verify both email and phone before signing up" });
        }
    
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
    
        // Save user
        const newUser = new User({
          username,
          email,
          contact,
          password: hashedPassword,
          role,
          firstname,
          lastname,
          gender,
          address,
          pincode,
          country,
          state,
          city,
          emailVerified: true,
          phoneVerified: true
        });
    
        console.log(role);
        await newUser.save();
    
        return res.status(201).json({ message: "Signup successful!" });
    
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", error: error.message });
      }
};
const OTP_EXPIRY = 10 * 60 * 1000;
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found!" });
        const expiry = new Date(Date.now() + OTP_EXPIRY);
        const otp = generateOtp();  // Generate OTP
        await Otp.findOneAndUpdate(
            { email },
            { email, otp, createdAt: new Date(), expiresAt: expiry },
            { upsert: true, new: true }
        );

        await sendEmail(email, `Your password reset OTP is: ${otp}`);
        res.status(200).json({ message: "OTP sent to your email." });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// 🔹 Step 2: Verify OTP
const verifyResetOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const storedOtp = await Otp.findOne({ email });
        if (!storedOtp) return res.status(400).json({ message: "OTP expired or invalid." });
        if (storedOtp.expiresAt < new Date()) return res.status(400).json({ message: "OTP expired." });
        if (storedOtp.otp !== otp) return res.status(400).json({ message: "Invalid OTP." });

        await Otp.deleteOne({ email });  // OTP verified, delete it
        res.status(200).json({ message: "OTP verified. You can reset your password now." });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// 🔹 Step 3: Reset Password
const resetPassword = async (req, res) => {
    const { email, password } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.findOneAndUpdate({ email }, { password: hashedPassword });
        res.status(200).json({ message: "Password reset successful!" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

const  UserEmailQuery=async(req,res)=>{
    const {name,email,subject,message}=req.body

    try {
        if(!name || !email || !subject || !message){
            return res.status(400).json({message:"All fields are required"})
        }
        await receiveEmail({name,email,subject,message})
        return res.status(200).json({message:"Query Sent Successfully"})
    } catch (error) {
        return res.status(500).json({message:"Server Error",error})
    }   
}

module.exports = { Login, Signup,verifyPhoneOtp,verifyEmailOtp,requestEmailOtp,requestPhoneOtp,forgotPassword, verifyResetOtp, resetPassword ,UserEmailQuery}
