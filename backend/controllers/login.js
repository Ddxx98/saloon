const User = require('../models/user');
const bcrypt = require('bcryptjs');

const jwt = require('../util/jwt');

exports.loginUser = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    try{
        const user = await User.findOne({ where: { email: email } });
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isEqual = bcrypt.compareSync(password, user.password);
        if(!isEqual) {
            return res.status(401).json({ message: "Invalid password" });
        }
        res.status(200).json({ message: "User logged in", token: jwt.generateToken(user), role: user.role  });
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}