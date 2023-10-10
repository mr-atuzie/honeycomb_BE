const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const protect = require("../middlewares/authMiddleware");
const { upload } = require("../utils/fileUpload");

router.route("/register").post(userController.registerUser);

router.route("/login").post(userController.loginUser);

router
  .route("/add-kyc")
  .put(protect, upload.single("image"), userController.addDocument);

module.exports = router;
