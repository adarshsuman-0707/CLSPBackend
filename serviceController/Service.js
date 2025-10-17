// controllers/serviceController.js

const Service = require("../models/Service.js");
const sendBookingStatusEmail=require('../utils/sendBookingStatusEmail.js')
const HistoryServiceDoneStatus = require("../models/History"); // adj
const User = require("../models/User.js");
const review = require("../models/reviewSchema.js");
const cron = require("node-cron");
const reviewSchema = require("../models/reviewSchema.js");
const addService = async (req, res) => {
  try {
    const { creatorId } = req.params;

    const {
      name,
      description,
      price,
      duration,
      category,
      availableSlots,
    } = req.body;

    const newService = new Service({
      name,
      description,
      price,
      duration,
      category,
      availableSlots, // Array of { date, time }
      createdBy: creatorId, // Using param now
    });

    const savedService = await newService.save();

    res.status(201).json({
      message: "Service created successfully",
      service: savedService,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const deleteSlotFromService = async (req, res) => {
  const { serviceId, slotId } = req.params;
  console.log(req.params);
  try {
    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      {
        $pull: { availableSlots: { _id: slotId } }
      },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({
      message: "Slot deleted successfully",
      service: updatedService
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const updateSlotBookingStatus = async (req, res) => {
  const { serviceId, slotId } = req.params;
  const { isBooked } = req.body;

  try {
    const service = await Service.findOneAndUpdate(
      { _id: serviceId, "availableSlots._id": slotId },
      {
        $set: {
          "availableSlots.$.isBooked": isBooked,
        },
      },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ message: "Service or Slot not found" });
    }

    res.status(200).json({
      message: "Slot booking status updated successfully",
      service,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const Allservices = async (req, res) => {
  try {
    const data = await Service.find().populate('createdBy', 'firstname lastname email phone address pincode contact');
    console.log(data, "find the services")

    if (!data) {
      return res.status(404).json({ message: "Service  not found" });
    }

    res.status(200).json({
      message: "Slot booking status updated successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
const bookServiceSlot = async (req, res) => {
  try {
    const { serviceId, slotId } = req.params;
    const userId = req.user.id; // token se nikla
    console.log("Booking/Cancel request:", { serviceId, slotId, userId });

    // Service fetch
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    // Slot find
    const slot = service.availableSlots.id(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    // ✅ If already booked by this user → cancel booking (only if pending)
    if (slot.isBooked && slot.bookedBy?.toString() === userId) {
      if (slot.bookingStatus === "Approved") {
        return res
          .status(400)
          .json({ message: "Cannot cancel, slot already confirmed" });
      }

      slot.isBooked = false;
      slot.bookedBy = null;
      slot.bookingStatus = "Rejected"; // canceled booking
      slot.bookedAt = null;

      await service.save();

      return res.json({
        message: "Booking cancelled successfully!",
        booking: {
          serviceName: service.name,
          slot: {
            date: slot.date,
            time: slot.time,
            status: slot.bookingStatus,
          },
          userId,
        },
      });
    }

    // ❌ If booked by another user → prevent cancellation
    if (slot.isBooked && slot.bookedBy?.toString() !== userId) {
      return res
        .status(400)
        .json({ message: "Slot already booked by another user" });
    }

    // ✅ If not booked → book it (set to pending)
    slot.isBooked = true;
    slot.bookedBy = userId;
    slot.bookingStatus = "pending"; // pending confirmation
    slot.bookedAt = new Date(); // store proper Date object

    await service.save();

    // User details fetch
    const user = await User.findById(userId).select("-password");

    res.json({
      message: "Service booked successfully (pending, will confirm in 2 min)!",
      booking: {
        serviceName: service.name,
        slot: {
          date: slot.date,
          time: slot.time,
          status: slot.bookingStatus,
        },
        user,
      },
    });
  } catch (error) {
    console.error("Booking/Cancel error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// CRON JOB (runs every 1 minute, auto-confirm after exactly 2 min)
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    console.log("⏰ Cron running at:", now.toLocaleString());

    // Fetch all services that have pending slots
    const services = await Service.find({ "availableSlots.bookingStatus": "pending" });

    for (const service of services) {
      let updated = false;

      service.availableSlots.forEach((slot) => {
        if (slot.bookingStatus === "pending" && slot.bookedAt) {
          const bookedTime = new Date(slot.bookedAt);
          const diffMs = now.getTime() - bookedTime.getTime();

          console.log(
            `Slot ${slot._id}: bookedAt=${bookedTime.toLocaleTimeString()}, now=${now.toLocaleTimeString()}, diffMs=${diffMs}`
          );

          // Only approve if 2 min (120000 ms) or more have passed
          if (diffMs >= 2 * 60 * 1000) {
            slot.bookingStatus = "Approved"; // auto-confirm
            updated = true;
            console.log(`✅ Slot ${slot._id} auto-confirmed at ${now.toLocaleTimeString()}`);
          }
        }
      });

      if (updated) {
        await service.save();
      }
    }
  } catch (err) {
    console.error("❌ Cron job error:", err);
  }
});

// Service man ke liye slot requests dekhne ki API
const getBookingRequests = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Service ko fetch karna + populate user details
    const service = await Service.findById(serviceId)
      .populate("availableSlots.bookedBy", "firstname lastname email phone address pincode");
    // ✅ yaha pe sirf ye fields ayengi

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Filter: Sirf booked slots
    const requests = service.availableSlots.filter(slot => slot.isBooked);

    res.status(200).json({
      message: "Booking requests fetched successfully",
      service: {
        _id: service._id,
        name: service.name,
        category: service.category,
      },
      requests: requests
    });

  } catch (err) {
    console.error("Error fetching booking requests:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateSlotStatus = async (req, res) => {
  try {
    const { serviceId, slotId } = req.params;
    const { status } = req.body;
    const userId = req.user._id; // 👈 login se aayega

    // 1. validate status
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: "Status must be Approved or Rejected" });
    }

    // 2. service fetch karo
    const service = await Service.findById(serviceId).populate("availableSlots.bookedBy", "name email");

    console.log(service,"sdhbfkshsdfgsdfsadfs")
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // 3. slot find karo
    const slot = service.availableSlots.id(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    // // 4. check bookedBy match
    // if (!slot.bookedBy || slot.bookedBy._id.toString() !== userId.toString()) {
    //   return res.status(403).json({ message: "You can update only your booked slot" });
    // }

    // 5. status update
    slot.bookingStatus = status;
    console.log(slot.bookedBy.email,"email k liye" )
  if (status === 'Approved') {
  await sendBookingStatusEmail(
    slot.bookedBy.email,
    `Accepted`,
    service.name,
    new Date().toLocaleString()   // ✅ correct
  );
} else {
  await sendBookingStatusEmail(
    slot.bookedBy.email,
    `Rejected`,
    service.name,
    new Date().toLocaleString()   // ✅ correct
  );
}

    console.log(slot.bookingStatus,"yh sfmsandfhaskldhfksaldh")
    await service.save();
 
    res.status(200).json({
      message: "Slot status updated successfully",
      slot
    });

  } catch (err) {
    console.error("Error updating slot status:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    // const userId = req.user._id; // login se aayega
    // console.log("Update request for service:", { serviceId, userId, body: req.body });
    // Extract fields from body that can be updated
    const { name, description, price, category, duration } = req.body;

    // 1. Fetch service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // 2. Update only service details, leave slots intact
    if (name) service.name = name;
    if (description) service.description = description;
    if (price) service.price = price;
    if (category) service.category = category;
    if (duration) service.duration = duration;

    // 3. Save updated service
    await service.save();

    res.status(200).json({
      message: "Service updated successfully",
      service
    });

  } catch (err) {
    console.error("Error updating service:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
const addServiceSlot = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({ message: "Date and Time are required" });
    }

    // Find service by ID
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Add slot to availableSlots
    service.availableSlots.push({
      date,
      time,
    });

    await service.save();

    return res.status(201).json({
      message: "Slot added successfully",
      service,
    });
  } catch (error) {
    console.error("Error adding slot:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const DeliveryServiceStatus=async(req,res)=>{
  try {
    const { serviceId, slotId } = req.params;
    const { status } = req.body;
    const userId = req.user._id; // 👈 login se aayeg
    console.log("Delivery status update request:", { serviceId, slotId, userId, status });
    console.log(status,"status")

    // 1. validate status
    if (!['completed', 'failed','pending'].includes(status)) {
      return res.status(400).json({ message: "Status must be completed , failed or pending" });
    } 
    // 2. service fetch karo
    const service = await Service.findById(serviceId).populate("availableSlots.bookedBy", "name email");
    if (!service) 
    {
      return res.status(404).json({ message: "Service not found" });
    }
    // 3. slot find karo
    const slot = service.availableSlots.id(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    console.log(slot,"slot")
    // 4. check bookedBy match
    if (!slot.bookedBy || slot.bookedBy._id.toString() === userId.toString()) {
      return res.status(403).json({ message: "You can update only your booked slot" });
    }
    if(status==="completed"){
    await sendBookingStatusEmail(
      slot.bookedBy.email,
      `Service Completed`,
      service.name, 
      new Date().toLocaleString()   // ✅ correct
    );

  }
  else{
    await sendBookingStatusEmail(
      slot.bookedBy.email,
      `Service Failed`,
      service.name, 
      new Date().toLocaleString()   // ✅ correct
    );
  }
    // 5. status update
    slot.ServiceDeliveryStatus = status;
    await service.save();
        if(status === "completed") {
      const historyData = {
        ServiceID: service._id,
        user: slot.bookedBy._id,
        serviceName: service.name,
        serviceDescription: service.description || "",
        serviceCategory: service.category || "",
        servicePrice: service.price || 0,
        serviceDuration: service.duration || "",
        serviceman: userId,
        servicemanName: req.user.firstname + " " + req.user.lastname,
        deliveryStatus: "completed",
        completedAt: new Date(),
       
      };
      console.log(historyData,"history data")
      await HistoryServiceDoneStatus.create(historyData);
    }
    res.status(200).json({
      message: "Service Delivery Status updated successfully",
      status: slot.ServiceDeliveryStatus
    });
  }
  catch (err) {

    console.error("Error updating slot status:", err);
    res.status(500).json({ message: "Something went wrong" });
  } 
};
const getuserReview = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1️⃣ Find all completed services for this serviceman
    const completedService = await HistoryServiceDoneStatus.find({ serviceman: userId });

    // 2️⃣ Extract all completed service IDs
    const completedServiceIds = completedService.map(service => service._id);

    // 3️⃣ Find all reviews linked to any of those service IDs
    const fetchedReview = await reviewSchema.find({
      reviewCardId: { $in: completedServiceIds }
    });

    // 4️⃣ Send response (same format as you wanted)
    res.status(200).json({
      completedServices: [completedService],
      fetchedReview
    });

  } catch (error) {
    console.error("Get Completed Deliveries Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = { addService, deleteSlotFromService, updateSlotBookingStatus, Allservices, bookServiceSlot, getBookingRequests,updateSlotStatus,updateService,addServiceSlot,DeliveryServiceStatus ,getuserReview};
