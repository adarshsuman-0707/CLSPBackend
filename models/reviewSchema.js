const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true, // kis service pe review diya jaa raha hai
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // jisne review diya (customer)
    },
    serviceman: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // jisne service di (service provider)
    },
    reviewCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HistoryServiceDoneStaus",
      required: true
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true, // rating (1–5 stars)
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100, // short title e.g. "Great Service!"
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000, // detailed review
    },
    images: [
      {
        type: String, // review ke sath images bhi upload kar sakte ho
      },
    ],
    isVerifiedCustomer: {
      type: Boolean,
      default: false, // sirf wohi review verified ho jo actual booking ke baad diya gaya
    },
  },
  {
    timestamps: true, // createdAt & updatedAt automatic add
  }
);

module.exports = mongoose.model("Review", reviewSchema);
