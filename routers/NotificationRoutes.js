const Router=require('express')
const route=Router();
const authmiddleware=require('../middleware/authmiddleware.js')
const {NotificationAdd,NotificationMarkRead,NotificationList}=require('../NotificationController/Notification.js')

route.post('/add',authmiddleware, NotificationAdd);
route.get('/list',authmiddleware, NotificationList);
route.post('/:id/read',authmiddleware, NotificationMarkRead);


module.exports=route
