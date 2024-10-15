const express    = require("express");
const bodyParser = require("body-parser");
const helmet     = require("helmet");
const cors       = require("cors");

const { authRouter } = require("./routes/auth.routes");
const dbConnect      = require("./config/db.config");

const app        = express();
const port       = process.env.port || 3000;

dbConnect();
require('dotenv').config();

//setup middlewares
app.use(cors());
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit:"1mb" }));

//setup routes
app.use("/api/v1/auth", authRouter)

app.listen(port ,() => {
    console.log(`App started in port : ${port}`);
});