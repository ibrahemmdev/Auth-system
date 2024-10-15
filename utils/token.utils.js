const jwt = require("jsonwebtoken");

const createToken = (payload, expire) => {
    return jwt.sign(payload, process.env.jwtSecret, { expiresIn: expire })
}

module.exports = createToken