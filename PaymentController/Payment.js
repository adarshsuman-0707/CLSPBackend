const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/PaymentStatus.js')
const HistoryService = require('../models/History.js')
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create order
const MakePayment = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt = "receipt#1" } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount required" });
    }

    console.log("🔹 Environment Keys Loaded:");
    console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
    console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "✅ Loaded" : "❌ Missing");

    const options = {
      amount: amount,
      currency,
      receipt,
    };

    console.log("📦 Creating Razorpay Order with:", options);

    const order = await razorpay.orders.create(options);
    console.log("✅ Order Created Successfully:", order);

    return res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("❌ Payment Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};


// ✅ Verify payment signature (after success)
const VerifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, ServiceId ,amount,userId } = req.body;

    console.log(req.body, " Verified Kro ")
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      const updatedService = await HistoryService.findByIdAndUpdate(
        ServiceId,
        { $set: { paymentStatus: true } },
        { new: true }
      );
      if (!updatedService) {
        return res.status(404).json({ success: false, message: "Service not found" });
      }
      await SavePaymentDetails({
        user:userId,
        orderId: razorpay_order_id,
        amount,
        status: "success",
        paymentResponse: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        },
      });

      return res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("❌ Verification Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
const SavePaymentDetails = async (body) => {
  try {
    const { user, orderId, amount, currency, paymentMethod, status, paymentGateway, paymentResponse } = body;

    // if (!user || !orderId || !amount) {
    //   return res.status(400).json({ error: "user, orderId and amount are required" });
    // }

    // Create new payment
    const payment = new Payment({
      user,
      orderId,
      amount,
      currency: currency || "INR",
      paymentMethod: paymentMethod || "card",
      status: status || "created",
      paymentGateway: paymentGateway || "Razorpay",
      paymentResponse: paymentResponse || {}
    });

    await payment.save();
    // res.status(201).json({ success: true, payment: savedPayment });

  } catch (error) {
    console.error(error);
    // res.status(500).json({ success: false, error: "Server Error" });
  }
}

const GetPaymentDetail = async (req, res) => {
  try {
    const payments = await Payment.find().populate("user", "name email");
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
}

module.exports = { MakePayment, VerifyPayment, GetPaymentDetail };
