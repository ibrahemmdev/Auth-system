const userModel = require("./../models/user.models");
const jwt       = require("jsonwebtoken");

const authorizationMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({ success: false, msg:"unauthorized"});
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.jwtSecret);

        const user = await userModel.findOne({ "_id": decoded.userId });

        if(!user) return res.status(400).json({ success: false, msg:"unauthorized"});

        if(!user.verifyEmail.verified){
            return res.status(400).json({ success: false, error:"You need to verify your email first"})
        }
        
        req.user = user

        next();

    } catch (error) {
        return res.status(400).json({ success: false, msg:"unauthorized"});
    }
}
module.exports = authorizationMiddleware