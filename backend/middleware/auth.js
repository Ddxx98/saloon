const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports.userAuthenticate = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Auth failed" });
    }
}