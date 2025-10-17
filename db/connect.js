const mongoose = require('mongoose');
require('dotenv').config(); 
const con=mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("connected to database");
})
.catch((err)=>{
    console.log(err);
});

