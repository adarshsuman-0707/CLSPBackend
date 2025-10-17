const Router=require('express')
const route=Router();
const servicemiddleware=require('../middleware/servicemiddleware.js')
const authmiddleware=require('../middleware/authmiddleware.js')

// const adminMiddleware=require('../middleware/adminmiddleware.js')
const {addService,deleteSlotFromService,updateService, updateSlotBookingStatus,Allservices,updateSlotStatus,getBookingRequests,addServiceSlot,DeliveryServiceStatus,getuserReview}=require('../serviceController/Service.js')

route.get("/services",authmiddleware, Allservices);
route.post("/add/:creatorId",servicemiddleware, addService);
route.delete('/:serviceId/slots/:slotId',servicemiddleware, deleteSlotFromService);
route.patch('/:serviceId/slot/:slotId',servicemiddleware, updateSlotBookingStatus);
// route.post('/book/:serviceId/slot/:slotId',authmiddleware, bookServiceSlot);//
route.get('/:serviceId/requests',servicemiddleware, getBookingRequests);
route.put("/:serviceId/slot/:slotId/status", servicemiddleware, updateSlotStatus);
route.post("/:serviceId/slots", servicemiddleware, addServiceSlot);
route.put("/:serviceId/slot/:slotId/delivery", servicemiddleware, DeliveryServiceStatus);
route.get('/service/getReviewDetails',servicemiddleware,getuserReview)
// http://localhost:5000/api/service/68ab405722cc12409b294942/slot/68e0fd04f7379da37dc2ed44/delivery
// http://localhost:5000/api/service/67f138c257c06507c37acfa4/slot/67f138c257c06507c37acfa6]
// http://localhost:5000/api/service/book/68ab427422cc12409b294957/slot/68ab427422cc12409b294958



route.put("/:serviceId", updateService);

module.exports=route