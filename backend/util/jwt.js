const jwt = require("jsonwebtoken");
require('dotenv').config();

exports.generateToken =  function (user) {
    return jwt.sign({ id: user.id, name: user.name, phone: user.phone, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
}