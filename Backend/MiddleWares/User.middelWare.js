require("dotenv").config();
const jwt = require("jsonwebtoken");

async function usermiddleware(req, res, next) {

    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Token not found" });
        }
        const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
  
        if (!verifyToken) {
            return res.status(401).json({ message: "Access denied" });
        }

        if (verifyToken.role !== "Customer") {
            return res.status(403).json({ message: "Access denied" });
        }

        req.user = verifyToken;

        next();
    } catch (error) {
        return res.status(500).json({ message: "Invalid token" });
    }
}

module.exports = usermiddleware;