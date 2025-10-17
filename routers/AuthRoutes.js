const Router =require("express")
const { 
    Login, 
    Signup, 
    requestEmailOtp, 
    requestPhoneOtp, 
    verifyEmailOtp, 
    verifyPhoneOtp,
    forgotPassword,
     verifyResetOtp, 
     resetPassword,
    UserEmailQuery} = require("../UserController/Auth.js");
const authMiddleware=require('../middleware/authmiddleware.js')
const adminMiddleware=require('../middleware/adminmiddleware.js')

const route=Router();

route.post('/Login',Login);
route.post('/Signup',Signup);
// OTP Routes
route.post('/request-email-otp', requestEmailOtp);
route.post('/request-phone-otp', requestPhoneOtp);
route.post('/verify-email-otp', verifyEmailOtp);
route.post('/verify-phone-otp', verifyPhoneOtp);
//reset password
route.post("/forgot-password", forgotPassword);  
route.post("/verify-reset-otp", verifyResetOtp);  
route.post("/reset-password", resetPassword);  

//routers without authmiddleware
route.post("/public-info", UserEmailQuery)

route.get("/profile", authMiddleware, (req, res) => {
    res.json({ message: "Welcome, User Profile", user: req.user });
});
route.get("/admin/dashboard", authMiddleware, adminMiddleware, (req, res) => {
    res.json({ message: "Welcome Admin, Here is your dashboard!" });
});


module.exports=route;