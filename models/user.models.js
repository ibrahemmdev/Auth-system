const mongoose = require("mongoose");
const bcrypt   = require("bcrypt");

const userSchema = mongoose.Schema({
    firstName      : { type: String, required: true },
    lastName       : { type: String, required: true },
    email          : { type: String, required: true },
    password       : { type: String, required: true },
    role           : { type: String, required: false, default:"user"},
    verifyEmail    : { type: Object, required: false, default:{} },
    twofa          : { type: Object, required: false, default:{} },
    banned         : { type: Boolean, default: false }
});

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) next();
    
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(this.password, salt);

    this.password = password
    
    next();
});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;