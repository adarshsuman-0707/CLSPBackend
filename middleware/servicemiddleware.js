const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Import user model

const servicemiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
   console.log("Received Token:", req.headers.authorization);
   console.log("Token: service :", token);

    if (!token) {
        return res.status(401).json({ message: "Access Denied, No Token Provided" });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);

        console.log("Decoded Token:", decoded); 

     
        if (!decoded.email) {
            return res.status(401).json({ message: "Invalid Token: Email Missing" });
        }

      
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(401).json({ message: "Unauthorized Access: User Not Found" });
        }

       
        if (user.role !='service') { 
            return res.status(403).json({ message: "Access Denied: You do not have permission to perform this action" });
        }

        req.user = user; 
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid Token" });
    }
};

module.exports = servicemiddleware;
