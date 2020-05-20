const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRouter = require("./routes/auth");
const permissionRouter = require("./routes/permission")
const bodyParser = require("body-parser");

dotenv.config();

mongoose.connect(
    process.env.DB_CONNECT,
    { useUnifiedTopology: true, useNewUrlParser: true },
    () => { console.log("DB is connected ... "); }),

// Service Middleware 
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use("/api/users", authRouter);
app.use("/api/permissions", permissionRouter);

// Run server
app.listen(3000, () => 
console.log("Server is running and listen on port " + 
            process.env.SERVICE_PORT 
            + " ..."));

