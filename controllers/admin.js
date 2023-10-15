const Notification = require("../models/Notification");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

const getAllTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({}).sort("-createdAt");

  res.status(201).json({ result: transactions.length, transactions });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).sort("-createdAt");

  res.status(201).json({ result: users.length, users });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  res.status(201).json(user);
});

const getAllPendingKyc = asyncHandler(async (req, res) => {
  const users = await User.find({ kycStatus: "pending" }).sort("-createdAt");

  res.status(201).json({ result: users.length, users });
});

const approveKyc = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  const newuser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: { kycStatus: "approved" },
    },
    {
      new: true,
    }
  );

  res.status(201).json({ newuser });
});

const disapproveKyc = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  const newuser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: { kycStatus: "disapprove" },
    },
    {
      new: true,
    }
  );

  res.status(201).json({ newuser });
});

const addNotification = asyncHandler(async (req, res) => {
  const { title, desc } = req.body;

  if (!title || !desc) {
    res.status(400);
    throw new Error("Please fill up all required fields.");
  }

  const notification = await Notification.create({
    title,
    desc,
  });

  if (notification) {
    res.status(201).json(notification);
  } else {
    res.status(400);
    throw new Error("Unable to send notification , Please try again");
  }
});

const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);

  res.status(204).json({
    success: true,
    message: "House has been removed from listing",
  });
});

const updateNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error("Not found ");
  }

  const newNotification = await Notification.findByIdAndUpdate(
    req.params.id,

    req.body,

    {
      new: true,
    }
  );

  res.status(201).json(newNotification);
});

module.exports = {
  updateNotification,
  deleteNotification,
  addNotification,
  disapproveKyc,
  approveKyc,
  getAllPendingKyc,
  getAllUsers,
  getAllTransactions,
  getUser,
};
