import jwt from "jsonwebtoken";

const Auth = (req, res, next) => {
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Not authorized, missing token" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Not authorized, bad format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({
      message: "Authentication failed: " + err.message,
    });
  }
};

export default Auth;
