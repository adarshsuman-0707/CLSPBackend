const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // kis user ko notification belong karta hai
    },
    type: {
      type: String,
      enum: ["service", "review", "offer","payment", "account", "system"], // notification type
      required: true,
    },
    title: {
      type: String,
      required: true, // short title
    },
    message: {
      type: String,
      required: true, // detailed message
    },
    link: {
      type: String, // optional, jahan click karne pe navigate kare
    },
    isRead: {
      type: Boolean,
      default: false, // unread by default
    },
    metadata: {
      type: Object, // optional extra info, e.g., { serviceId: "...", reviewId: "..." }
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
