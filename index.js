const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = express();
const userRoute = require("./src/routes/user");
const authRoute = require("./src/routes/auth");
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(cors());
dotenv.config();
app.use(bodyParser.json());

app.use("/user", userRoute);
app.use("/auth", authRoute);

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connect to MongoDB successfully!!!");
  })
  .catch((error) => {
    console.log("Connect to MongoDB failure!!! ", error);
  });

const port = process.env.PORT || 8081;

app.listen(port, () => {
  console.log("Server is listening on " + port);
});
