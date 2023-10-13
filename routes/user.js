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

router.route("/login-status").get(userController.loginStatus);

router.route("/update-user").patch(protect, userController.updateUser);

router.route("/").get(protect, userController.getUser);

router.route("/invest").post(protect, userController.invest);

router
  .route("/transaction-history")
  .get(protect, userController.transactionHistory);

router.route("/notifications").get(protect, userController.getNotifications);

module.exports = router;
