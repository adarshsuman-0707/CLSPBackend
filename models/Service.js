const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  date: Date,
  time: String,
  isBooked: {
    type: Boolean,
    default: false,
  },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  bookingStatus: { type: String, enum: ["pending", "Approved", "Rejected"], default: "pending" },
  bookedAt: { type: Date, default: Date.now() },
  ServiceDeliveryStatus: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
});

const serviceSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to User model
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: String,
    default: "30 mins",
  },
  category: {
    type: String,
    required: true,
  },
  availableSlots: [slotSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Service", serviceSchema);
