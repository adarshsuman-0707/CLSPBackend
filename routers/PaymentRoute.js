const Router=require('express')
const route=Router();
const authmiddleware=require('../middleware/authmiddleware.js')
const {MakePayment,VerifyPayment,SavePaymentDetails,GetPaymentDetail} =require('../PaymentController/Payment.js')
route.post('/MakePayment',authmiddleware,MakePayment);
route.post("/verify",authmiddleware, VerifyPayment);
// route.post('/SavePaymentinfo',authmiddleware,SavePaymentDetails);
route.get('/GetPaymentinfo',authmiddleware,GetPaymentDetail);
module.exports=route