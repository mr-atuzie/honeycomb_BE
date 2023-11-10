const dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
// const morgan = require("morgan");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const path = require("path");

const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");

const app = express();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(morgan("dev"));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://honeycombfxd.com",
      "https://honeycombfxd-admin.com",
    ],
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// connect DB
const connectDB = () => {
  mongoose
    .connect(process.env.DB)
    .then(() => {
      console.log("Database connected successfuly.");
    })
    .catch((error) => {
      console.log(error);
    });
};

//Routes
app.get("/", (req, res) => {
  res.send("Honey comb fxd farm");
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);

//Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  connectDB();
  console.log(`Servering run on port:${PORT}`);
});
