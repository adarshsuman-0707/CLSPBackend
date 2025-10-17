const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Import user model

const authMiddleware = async (req, res, next) => {
   const token = req.headers.authorization?.split(" ")[1];
   console.log("Received Token:", req.headers.authorization);


    if (!token) {
        return res.status(401).json({ message: "Access Denied, No Token Provided" });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);

        console.log("Decoded Token:", decoded); // 🛠 Debugging ke liye

        // ✅ Ensure email exists in token
        if (!decoded.email) {
            return res.status(401).json({ message: "Invalid Token: Email Missing" });
        }

        // ✅ Fetch user from database
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(401).json({ message: "Unauthorized Access: User Not Found" });
        }

        req.user = user; // Attach user to request
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid Token" });
    }
};

module.exports = authMiddleware;
