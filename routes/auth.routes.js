const express = require("express")

const { registerValidator, loginValidator, verifyEmailValidator } = require("./../validators/auth.validators")
const { userRegister, userLogin, emailVerify, requestTwofa, enableTwofa }      = require("./../controllers/auth.controllers")

const authorizationMiddleware = require("./../middlewares/authorization.middlewares");

const authRouter = express.Router();

authRouter.post("/register", registerValidator, userRegister);
authRouter.post("/login", loginValidator, userLogin);
authRouter.put("/verify-email", verifyEmailValidator, emailVerify);

authRouter.get("/request-twofa", authorizationMiddleware, requestTwofa);
authRouter.post("/enable-twofa", authorizationMiddleware, enableTwofa);

exports.authRouter = authRouter