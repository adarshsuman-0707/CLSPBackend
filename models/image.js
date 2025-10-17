const mongoose=require('mongoose')
const ImageSchema=mongoose.Schema({
    path:{
        type:String,
        required:true
    },
    filename:{
        type:String,
        required:true
    },
    ProfileUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
})

module.exports=mongoose.model('Image',ImageSchema)