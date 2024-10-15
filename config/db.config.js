const mongoose = require("mongoose");

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.mongodbUri);
        console.log("Mongodb connected successfully");
    } catch (error) {
        console.log(`Error while connecting to mongodb ${error.message}`)
    }
}

module.exports = dbConnect