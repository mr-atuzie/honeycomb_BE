const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const protect = require("../middlewares/authMiddleware");
const { upload } = require("../utils/fileUpload");

router.route("/register").post(userController.registerUser);

router.route("/login").post(userController.loginUser);

router.route("/verify-email").post(protect, userController.verifyEmail);

router.route("/investments").get(protect, userController.userInvestments);

router.route("/content").get(userController.getContent);

router
  .route("/add-kyc")
  .put(protect, upload.single("image"), userController.addDocument);

router
  .route("/upload-picture")
  .put(protect, upload.single("image"), userController.uploadPicture);

router.route("/login-status").get(userController.loginStatus);

router.route("/update-user").patch(protect, userController.updateUser);

router.route("/forgot-password").patch(protect, userController.forgetPassword);

router.route("/").get(protect, userController.getUser);

router
  .route("/low-risk-investment")
  .post(protect, userController.lowRiskInvestment);

router.route("/logout").get(userController.logout);

router
  .route("/high-risk-investment")
  .post(protect, userController.highRiskInvestment);

router.route("/reinvest/:id").post(protect, userController.reInvest);

router.route("/withdraw/:id").get(protect, userController.withdraw);

router.route("/final-withdraw/:id").get(protect, userController.finalWithdraw);

router.route("/investment/:id").get(protect, userController.userInvestment);

router
  .route("/transaction-history")
  .get(protect, userController.transactionHistory);

router.route("/referrals").get(protect, userController.userReferrals);

router.route("/user-withraws").get(protect, userController.transactionHistory);

router
  .route("/filter-transactions-month")
  .post(protect, userController.filterTransactionsByMonth);

router.route("/notifications").get(protect, userController.getNotifications);

router.route("/notification/:id").get(protect, userController.getNotification);

module.exports = router;
