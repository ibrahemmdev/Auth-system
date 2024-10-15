const asyncHandler = require("express-async-handler");
const userModel    = require("./../models/user.models");
const bcrypt       = require("bcrypt");
const createToken  = require("./../utils/token.utils");
const crypto       = require('crypto');
const sendEmail    = require("./../utils/send-email.utils");
const jwt          = require("jsonwebtoken");
const twofactor    = require("node-2fa");

exports.userRegister = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        const EmailVerifyToken = crypto.randomBytes(32).toString('hex');
        
        const user = await new userModel({
            firstName,
            lastName,
            email,
            password,
            verifyEmail:{
                token: EmailVerifyToken,
                usedAt: null,
                expiredAt: Date.now() + 30 * 60 * 1000,
                genAt: Date.now(),
                verified: false
            }
        }).save();

        const emailJwt = createToken({ userId: user._id, token: EmailVerifyToken}, "30m")

        res.status(200).json({ success: true, msg: "New user registered successfully"});

        const options = {
            email,
            subject: "Verify your account",
            message: `Dear ${firstName},\n\nThank you for registering with lom. To complete your registration and activate your account, please verify your email address by clicking the link below:\n\n${process.env.baseUrl}/verify-email/${emailJwt}\n\nIf you did not create this account, please ignore this email.\n\nThis verification link will expire in 1 hour.\n\nThank you,  \nThe lom Team`
        }

        sendEmail(options);
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message});
    }
});

exports.userLogin = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if(!user){
            return res.status(400).json({ success: false, error: "Invalid email or password"}); 
        } 

        const isMatched = await bcrypt.compare(password, user.password);

        if(!isMatched){
            return res.status(400).json({ success: false, error: "Invalid email or password"}); 
        }

        if(!user.verifyEmail.verified){
            return res.status(400).json({ success: false, error:"You need to verify your email first"})
        }
        
        if(user.twofa.enabled){
            const { twofa } = req.body;

            if(!twofa) return res.status(400).json({ success: false, error:"Please provide 2fa token"})

            const verifyTwofa = twofactor.verifyToken(user.twofa.secret, twofa);

            if(verifyTwofa.delta && verifyTwofa.delta !== 0) return res.status(400).json({ success: false, error:"Invalid 2fa token"});
        } 

        const accessToken = createToken({ userId: user._id }, "3d");

        return res.status(200).json({ success: true, msg: "Login success", accessToken });

    } catch (error) {
        return res.status(400).json({ success: false, error: error.message});
    }
});

exports.emailVerify = asyncHandler(async (req, res, next) => {
    const { token } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.jwtSecret);

        if(!decoded) return res.status(400).json({ success: false, error:"Invalid token or expire"});

        const user = await userModel.findOne({
            "_id": decoded.userId,
            "verifyEmail.token": decoded.token,
            "verifyEmail.expiredAt": { $gt: Date.now() }
        });

        if(!user) return res.status(400).json({ success: false, error:"Invalid token or expire"});

        await userModel.updateOne({
            "_id": decoded.userId,
        },{
            "verifyEmail.token": null,
            "verifyEmail.usedAt": Date.now(),
            "verifyEmail.expiredAt": null,
            "verifyEmail.verified": true
        });

        return res.status(200).json({ success: true, msg:"Successfully verify email, Back and relogin."})
    } catch (error) {
        return res.status(400).json({ success: false, error:"Invalid token or expire"});
    }   
});

exports.requestTwofa = asyncHandler(async (req, res, next) => {
    const user = req.user;

    try {

        if(user.twofa.enabled) return res.status(400).json({ success: false, msg: "You already enabled 2fa"});

        const s = twofactor.generateSecret({ name: "sup", account: user?.firstName });

        await userModel.updateOne({"_id": user._id}, { twofa: {
            secret: s.secret,
            lastUse: null,
            createdAt: Date.now(),
            enabled: false
        }});

        return res.status(200).json({ success: true, msg: "2FA secret generated successfully", uri: s.uri, qr: s.qr });
    } catch (error) {
        return res.status(400).json({ success: false, error: "Failed to enable 2FA" });
    } 
});

exports.enableTwofa = asyncHandler(async (req, res, next) => { 
    const user = req.user;
    const { twofa } = req.body;

    try {

        if(user.twofa.enabled) return res.status(400).json({ success: false, msg: "You already enabled 2fa"});

        if(!twofa) return res.status(400).json({ success: false, error:"Please provide 2fa token"})

        const verifyTwofa = twofactor.verifyToken(user.twofa.secret, twofa);

        if(verifyTwofa.delta && verifyTwofa.delta !== 0) return res.status(400).json({ success: false, error:"Invalid 2fa token"});

        await userModel.updateOne({"_id": user._id}, { twofa: {
            secret: user.twofa.secret,
            lastUse: Date.now(),
            createdAt: user.twofa.createdAt,
            enabled: true
        }});

        return res.status(200).json({ success: true, msg: "2fa successfully enabled"});
    } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, error: "Failed to enable 2FA" });
    }  
});