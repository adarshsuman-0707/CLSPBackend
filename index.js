
const express = require('express');
const cors=require('cors')
require('./db/connect.js')
const helmet=require('helmet')
require('dotenv');
const multer=require('multer')
const ImageModel=require('./models/image.js')
const path=require('path')

const AuthRoutes =require('./routers/AuthRoutes.js')
const UserRoutes=require('./routers/UserRoute.js')
const serviceRoutes=require('./routers/ServiceRoute.js')
const NotificationRoutes=require('./routers/NotificationRoutes.js')
const Payment=require('./routers/PaymentRoute.js')
const app=express();
// middleware heres
app.use(express.json())
app.use(express.urlencoded({extended:false}));
app.use(express.static('uploads'))
app.use(cors());
app.use(helmet())

//here setup for server side
app.set('view engine',"ejs")


 
// route middleware setting up 
 app.use('/api/auth',AuthRoutes);
 app.use('/api/user',UserRoutes);
 app.use('/api/service',serviceRoutes);
 app.use('/api/Notification',NotificationRoutes);
 app.use('/api/payment',Payment)

 const storage = multer.diskStorage({
   destination: function (req, file, cb) {
     cb(null, './uploads')
   },
   filename: function (req, file, cb) {
     cb(null,Date.now() + '-' + file.originalname)
   }
 })
 
 const upload = multer({ storage })

 app.post("/profile/upload", upload.single("image"), async (req, res) => {
   try {
     if (!req.file) return res.status(400).json({ message: "No file uploaded" });
 
     const { filename, path } = req.file;
     const image = new ImageModel({ filename, path });
 
     await image.save();
 
     res.status(201).json({
       message: "Image uploaded successfully",
       image: {
         filename,
         url: `/uploads/${filename}` // Optional: URL to serve image
       }
     });
   } catch (error) {
     console.error("Upload error:", error);
     res.status(500).json({ message: "Image upload failed", error: error.message });
   }
 });
 app.get('/files/:id', async (req, res) => {
   try {
     const image = await ImageModel.findById(req.params.id);
     if (!image) return res.status(404).send('Image not found');
 
     const imagePath = path.join(__dirname, "uploads", image.filename);
     res.sendFile(imagePath);
   } catch (e) {
     console.error(e);
     res.status(500).send('Error retrieving image');
   }
 });
const port=5000
 app.listen(port,()=>{
    console.log("Server Run on port" +port);
 })