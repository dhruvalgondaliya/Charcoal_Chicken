import jwt from "jsonwebtoken";
import User from "../Models/User.js"; 

const Auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-Password");
    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

export default Auth;