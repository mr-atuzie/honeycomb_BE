const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");
const adminController = require("../controllers/admin");

router.route("/register").post(protect, isAdmin, adminController.registerAdmin);

router.route("/login").post(adminController.loginAdmin);

router
  .route("/all-transactions")
  .get(protect, isAdmin, adminController.getAllTransactions);

router
  .route("/pending-kyc")
  .get(protect, isAdmin, adminController.getAllPendingKyc);

router
  .route("/pending-withdraws")
  .get(protect, isAdmin, adminController.getAllPendingWithdraws);

router
  .route("/total-investment")
  .get(protect, isAdmin, adminController.totalInvestments);

router
  .route("/total-intrest")
  .get(protect, isAdmin, adminController.totalIntrest);

router
  .route("/total-referrals")
  .get(protect, isAdmin, adminController.totalReferrals);

router.route("/all-users").get(protect, isAdmin, adminController.getAllUsers);

router.route("/user/:id").get(protect, isAdmin, adminController.getUser);

router
  .route("/investment/:id")
  .get(protect, isAdmin, adminController.getInvestment);

router
  .route("/filter-transactions-month")
  .post(protect, isAdmin, adminController.filterTransactionsByMonth);

router
  .route("/filter-user-month")
  .post(protect, isAdmin, adminController.filterUserByMonth);

router
  .route("/approve-kyc/:id")
  .get(protect, isAdmin, adminController.approveKyc);

router.route("/get").get(protect, isAdmin, adminController.search);

router
  .route("/disapprove-kyc/:id")
  .get(protect, isAdmin, adminController.disapproveKyc);

router
  .route("/add-notification")
  .post(protect, isAdmin, adminController.addNotification);

router.route("/hero").put(protect, isAdmin, adminController.heroContent);

router.route("/about").put(protect, isAdmin, adminController.aboutContent);

router.route("/how").put(protect, isAdmin, adminController.howContent);

router.route("/value").put(protect, isAdmin, adminController.valueContent);

router.route("/payout/:id").get(protect, isAdmin, adminController.payout);

router
  .route("/high-payout/:id")
  .get(protect, isAdmin, adminController.highpayout);

router
  .route("/update-notification/:id")
  .put(protect, isAdmin, adminController.updateNotification);

router
  .route("/transaction-history/:id")
  .get(protect, isAdmin, adminController.userTransactionHistory);

router
  .route("/investments/:id")
  .get(protect, isAdmin, adminController.userInvestments);

router
  .route("/referrals/:id")
  .get(protect, isAdmin, adminController.userInvestments);

router
  .route("/delete-notification/:id")
  .delete(protect, isAdmin, adminController.deleteNotification);

module.exports = router;
