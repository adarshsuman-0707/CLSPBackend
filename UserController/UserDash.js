const Service = require('../models/Service');
const User = require('../models/User')
const SavedService=require('../models/SaveService')
const HistoryServiceDoneStatus = require("../models/History"); // adj
const Review = require('../models/reviewSchema');``
const userProfile = async (req, res) => {
    try {
        const tokenEmail = req.user.email;
        console.log(tokenEmail, "token email ka data ");
        const user = await User.findOne({ email: tokenEmail });
        if (!user) return res.status(404).json({ error: "User not found and  MAy be invalid email" })
        console.log(user);
        return res.json({
            username: user.username,
            email: user.email,
            contact: user.contact,
            address: user.address,
            Id:user._id,
            state:user.state,
            city:user.city,
            country:user.country,
            pincode:user.pincode,
            firstname:user.firstname,
            lastname:user.lastname,
            gender:user.gender,
            role:user.role

        });
    } catch (error) {
        console.log("Error arise in fetching profile user");
        res.status(500).json({ error: "Server error" });
    }
};

const userDataUpdate=async(req,res)=>{
    console.log(req.body);
  
  try{  
    const {Id,firstname,lastname,city,country,state,address,pincode}=req.body
    if (!Id) {
        return res.status(400).json({ message: "User ID is required" });
    }

  
    const updatedUser = await User.findByIdAndUpdate(
        Id, 
        { firstname, lastname, city, country, state, address, pincode },
        { new: true, runValidators: true } 
    );

    if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", updatedUser });
} catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal Server Error" });
}

}
const userDeleteProfile=async(req,res)=>{
try {
    const {id}=req.params
    console.log(req.params)
    if(!id){
        return res.status(400).json({ message: "User ID is required" });
    }
    else{
        let res=await User.findByIdAndDelete(id);
        if(res){
            res.status(200).json({ message: "User deleted successfully" });

        }
    }
    
} catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal Server Error" });
}
}
const UserSavedService = async (req, res) => {
  try {
    const serviceId = req.params.serviceId; // service id from frontend (URL)
    const userId = req.user._id;            // user id from token (auth middleware)

    if (!serviceId || !userId) {
      return res.status(400).json({ message: "Service ID and User ID are required" });
    }

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Check if already saved
    const alreadySaved = await SavedService.findOne({savedService: serviceId });
    console.log(alreadySaved, "already saved wala data");
    if (alreadySaved) {
      return res.status(200).json({ message: "Service already saved", savedService: alreadySaved });
    }

    // Save new service for user
    const newSaved = new SavedService({
      savedBy: userId,
      savedService: serviceId,
    });

    await newSaved.save();

    return res.status(201).json({
      message: "Service saved successfully",
      savedService: newSaved,
    });

  } catch (error) {
    console.error("Save Service Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUserSavedServices = async (req, res) => {
  try {
    const userId = req.user._id;

    const saved = await SavedService.find({ savedBy: userId })
      .populate({
        path: "savedService",       // Service model ki details
        select: "name description price duration category availableSlots"
      });

    // Agar koi service hi saved nahi hai
    if (!saved || saved.length === 0) {
      return res.status(200).json({
        message: "No saved services found",
        savedServices: []
      });
    }

    return res.status(200).json({
      message: "User saved services fetched successfully",
      savedServices: saved.map(item => ({
        id: item._id,
        savedAt: item.savedAt,
        service: {
          id: item.savedService?._id,
          name: item.savedService?.name,
          description: item.savedService?.description,
          price: item.savedService?.price,
          duration: item.savedService?.duration,
          category: item.savedService?.category,
          availableSlots: item.savedService?.availableSlots
        }
      }))
    });

  } catch (error) {
    console.error("Get Saved Services Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
//{"message":"User saved services fetched successfully","savedServices":[{"id":"68dd6793d70f69148edebb14","savedAt":"2025-10-01T17:40:35.414Z","service":{"id":"68ab405722cc12409b294942","name":"Pipe","description":"Money","price":12343,"duration":"1","category":"Electrician","availableSlots":[{"date":"2025-09-30T00:00:00.000Z","time":"12:40","isBooked":true,"bookedBy":"68ab3e0b22cc12409b294919","bookingStatus":"Approved","_id":"68d2f09cb5a37a37b800fe8c","bookedAt":"2025-09-30T17:52:53.839Z"}]}}]}
const removeSavedService = async (req, res) => {
  try {
    const userId = req.user._id;
    const serviceId = req.params.serviceId;

    const deleted = await SavedService.findOneAndDelete({
      savedBy: userId,
      savedService: serviceId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Service not found in saved list" });
    }

    return res.status(200).json({ message: "Service unsaved successfully" });
  } catch (error) {
    console.error("Remove Saved Service Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const addReview = async (req, res) => {
  try {
    const { serviceId, rating, title, comment, reviewCardId } = req.body;
    const userId = req.user._id; // customer (from token)
    console.log(req.body, "review wala data");

    // 1. Service fetch karo
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    // 2. Check booking completed
    const bookedSlot = service.availableSlots.find(
      s => s.bookedBy?.toString() === userId.toString() && s.ServiceDeliveryStatus === "completed"
    );
    if (!bookedSlot) {
      return res.status(400).json({ message: "You can only review after service completion" });
    }

    // 3. Upsert review (update if reviewCardId exists, else create new)
    const review = await Review.findOneAndUpdate(
      { reviewCardId }, // filter by card
      {
        service: serviceId,
        reviewer: userId,
        serviceman: service.createdBy,
        reviewCardId,
        rating,
        title,
        comment,
        isVerifiedCustomer: true,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    console.log(review, "review added/updated");
    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
const getCompletedDeliveries = async (req, res) => {
  try {
    const userId = req.user._id;
    const completedServices = await HistoryServiceDoneStatus.find({ user: userId });
    res.status(200).json({ completedServices });
  } catch (error) {

    console.error("Get Completed Deliveries Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const getReviewDetails = async (req, res)=>{
  try{
    const userId=req.user._id
    console.log("User ID for reviews:", userId);
   const reviews=await Review.find({reviewer:userId});
    console.log("Fetched reviews:", reviews);
    res.status(200).json({reviews});
  }
  catch(error){
    console.log("Error in fetching review details:", error);
  }
}

module.exports = { userProfile,userDataUpdate,userDeleteProfile,UserSavedService,getUserSavedServices,removeSavedService,addReview,getCompletedDeliveries,getReviewDetails };

// module.exports={userProfile}