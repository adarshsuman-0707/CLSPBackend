const mongoose = require("mongoose");
const { Schema } = mongoose;

// Payment Schema
const paymentSchema = new Schema(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: "User", // User model se reference
      required: true 
    },
    orderId: { 
      type: String, 
      required: true,
      unique: true // each payment linked to a unique order
    },
    amount: { 
      type: Number, 
      required: true 
    },
    currency: { 
      type: String, 
      default: "INR" 
    },
    paymentMethod: { 
      type: String, 
      enum: ["card", "upi", "wallet", "netbanking", "other"], 
      default: "card" 
    },
    status: { 
      type: String, 
      enum: ["created", "pending", "success", "failed", "refunded"], 
      default: "created" 
    },
    paymentGateway: { 
      type: String, 
      default: "Razorpay" 
    },
    paymentResponse: {
      type: Object, // raw response from gateway for verification/audit
      default: {}
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    updatedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

// Automatically update updatedAt
paymentSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Payment", paymentSchema);
