const Router=require('express')
const route=Router();
const authMiddleware=require('../middleware/authmiddleware.js')
// const adminMiddleware=require('../middleware/adminmiddleware.js')
const {userProfile,userDataUpdate,userDeleteProfile,UserSavedService,getUserSavedServices,removeSavedService,addReview,getCompletedDeliveries,getReviewDetails}=require('../UserController/UserDash.js')
const {bookServiceSlot}=require('../serviceController/Service.js')

route.get('/userProfile',authMiddleware,userProfile);
route.post('/updateUser',authMiddleware,userDataUpdate);
route.delete('/deleteProfile/:id',authMiddleware,userDeleteProfile);
route.post('/book/:serviceId/slot/:slotId',authMiddleware, bookServiceSlot);
//save srvice Section 
route.post('/saveService/:serviceId',authMiddleware,UserSavedService);
route.get('/getUserSavedService',authMiddleware,getUserSavedServices);
route.delete('/removeSavedService/:serviceId',authMiddleware,removeSavedService);
// Review Section
route.post('/addReview',authMiddleware,addReview);
route.get('/getReviewDetails',authMiddleware,getReviewDetails);

//History Section
route.get('/completedDeliveries',authMiddleware,getCompletedDeliveries);
//http://localhost:5000/api/user/removeSavedService/68ab405722cc12409b294942
module.exports=route