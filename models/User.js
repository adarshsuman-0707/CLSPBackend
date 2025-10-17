
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    pincode:{
        type:String,
        required:true,
        maxLength:6,
        minLength:6
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "user","service"],
      
    },
    contact: {
        type: String,  // Use String for phone numbers
        required: true,
        minLength:10,
        maxLength:10,
        // match: [/^[6-9]\d{9}$/, "Invalid Indian mobile number"]
    },
    state:{
        type: String,  // Use String for phone numbers
        required: true,
    },
    country:{
        type: String,  // Use String for phone numbers
        required: true,
    },
    city :{
        type: String,  // Use String for phone numbers
        required: true,
    },
    gender:{
        type: String,  // Use String for phone numbers
        required: true,
        enum: ["male", "female", "other"],
    },
    emailVerified: {
        type: Boolean,
        default: false  // User ka email jab tak verify nahi hoga, ye `false` rahega
    },
    phoneVerified: {
        type: Boolean,
        default: false  // Phone verification ke liye
    },
    address:{
        type:String
        , default :"NA"
    },
    profileImage:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Image'
},
    previousServices: [
        {
            serviceName: {
                type: String, // "Plumbing", "Carpentry")
                // required: true
            },
            serviceDate: {
                type: Date, 
                // required: true
            },
            providerName: {
                type: String 
            },
            feedback: {
                type: String
            }
        }
    ]
},{timeStamp:true});

module.exports = mongoose.model("User", userSchema);
