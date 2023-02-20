const express = require("express");
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const mongoose = require("mongoose");
const app = express();
const { v4: uuidv4 } = require("uuid");
app.use(bodyParser.json());
const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4());
  },
});
app.use(multer({ storage: fileStorage }).single("image"));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,contenttype,Authorization"
  );
  next();
});
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500
  const message = error.message;
  res.status(status).json({ message: message });
});
app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);
mongoose
  .connect(
    "mongodb+srv://Siddheshya:Siddheshya%40007@cluster0.famxq9l.mongodb.net/?retryWrites=true&w=majority"
  )
  .then((reuslt) => {
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
