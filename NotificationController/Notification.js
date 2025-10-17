 const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// 1️⃣ Add new notification
const NotificationAdd = async (req, res) => {
  try {
    const { type, title, message, link, metadata } = req.body;
    const user = req.user._id; // logged-in user from token

    const notification = new Notification({
      user,
      type,
      title,
      message,
      link,
      metadata,
    });

    await notification.save();
    res.status(201).json({ message: "Notification created", notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 2️⃣ Get all notifications for logged-in user
const NotificationList = async (req, res) => {
  try {
    const user = req.user._id;

    const notifications = await Notification.find({ user }).sort({ createdAt: -1 });
    res.status(200).json({ notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 3️⃣ Mark a notification as read
const NotificationMarkRead = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user },
      { isRead: true },
      { new: true }
    );

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  NotificationAdd,
  NotificationList,
  NotificationMarkRead,
};
