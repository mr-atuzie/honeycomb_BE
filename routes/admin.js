const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");
const adminController = require("../controllers/admin");

router
  .route("/all-transactions")
  .get(protect, isAdmin, adminController.getAllTransactions);

router
  .route("/pending-kyc")
  .get(protect, isAdmin, adminController.getAllPendingKyc);

router.route("/all-users").get(protect, isAdmin, adminController.getAllUsers);

router
  .route("/approve-kyc/:id")
  .get(protect, isAdmin, adminController.approveKyc);

router
  .route("/disapprove-kyc/:id")
  .get(protect, isAdmin, adminController.disapproveKyc);

router
  .route("/add-notification")
  .post(protect, isAdmin, adminController.addNotification);

router
  .route("/update-notification/:id")
  .put(protect, isAdmin, adminController.updateNotification);

router
  .route("/delete-notification/:id")
  .delete(protect, isAdmin, adminController.deleteNotification);

module.exports = router;
