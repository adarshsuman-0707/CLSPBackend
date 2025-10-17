const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  ServiceID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  serviceDescription: {
    type: String
  },
  serviceCategory: {
    type: String
  },
  servicePrice: {
    type: Number
  },
  serviceDuration: {
    type: String
  },
  serviceman: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true // the person who completed the service
  },
  servicemanName: {
    type: String
  },
  deliveryStatus: {
    type: String,
    enum: ["failed", "in-progress", "completed"],
    default: "in-progress"
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  additionalNotes: {
    type: String
  },
  paymentStatus:{
    type:Boolean,
    default:false
  }
}, { timestamps: true });

module.exports = mongoose.model("HistoryServiceDoneStaus", historySchema);
