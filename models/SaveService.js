const mongoose = require("mongoose");

const SaveServiceSchema = new mongoose.Schema({
  savedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Which user saved this service
    required: true,
  },
  savedService: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service", // Which service is being saved
    required: true,
  },
  savedAt: {
    type: Date,
    default: Date.now, // Track when it was saved
  },
  status: {
    type: String,
    enum: ["active", "removed"], // User can "un-save" or remove later
    default: "active",
  },
  notes: {
    type: String,
    maxlength: 250, // Optional user note about the service
  },
  tags: [{
    type: String, // Add custom tags for quick grouping (ex: "favourite", "urgent")
  }]
}, { timestamps: true }); // Also adds createdAt and updatedAt automatically

module.exports = mongoose.model("SavedService", SaveServiceSchema);
