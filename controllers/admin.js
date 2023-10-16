const Content = require("../models/Content");
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

const heroContent = asyncHandler(async (req, res) => {
  const { title, desc } = req.body;

  if (!title || !desc) {
    res.status(400);
    throw new Error("Please fill up all required fields.");
  }

  const content = await Content.findByIdAndUpdate(
    "652c8c7a7ba8c309c3c8c005",

    {
      $set: { hero: req.body },
    },

    {
      new: true,
    }
  );

  if (content) {
    res.status(201).json(content);
  } else {
    res.status(400);
    throw new Error("Unsuccessful, Please try again");
  }
});

const aboutContent = asyncHandler(async (req, res) => {
  const { title, desc } = req.body;

  if (!title || !desc) {
    res.status(400);
    throw new Error("Please fill up all required fields.");
  }

  const content = await Content.findByIdAndUpdate(
    "652c8c7a7ba8c309c3c8c005",

    {
      $set: { about: req.body },
    },

    {
      new: true,
    }
  );

  if (content) {
    res.status(201).json(content);
  } else {
    res.status(400);
    throw new Error("Unsuccessful, Please try again");
  }
});

const serviceContent = asyncHandler(async (req, res) => {
  const { title, desc } = req.body;

  if (!title || !desc) {
    res.status(400);
    throw new Error("Please fill up all required fields.");
  }

  const content = await Content.findByIdAndUpdate(
    "652c8c7a7ba8c309c3c8c005",

    {
      $set: { service: req.body },
    },

    {
      new: true,
    }
  );

  if (content) {
    res.status(201).json(content);
  } else {
    res.status(400);
    throw new Error("Unsuccessful, Please try again");
  }
});

const payout = asyncHandler(async (req, res) => {
  const payee = await User.findById(req.params.id);
  const payer = await User.findById(req.user._id);

  const { amount, type } = req.body;

  if (!payee) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  if (!amount || !type) {
    res.status(400);
    throw new Error("Unable to complete transaction");
  }

  const oldBalance = payee.accountBalance;
  const currentBalance = payee.accountBalance - amount;

  const newUser = await User.findByIdAndUpdate(
    payee._id,
    {
      $set: { accountBalance: currentBalance },
    },
    {
      new: true,
    }
  );

  const name = `${payer.firstname} ${payer.lastname}`;

  const transaction = await Transaction.create({
    userId: payee._id,
    name,
    email: payer.email,
    type,
    amount,
    date: Date.now(),
    currentBalance: newUser.accountBalance,
    oldBalance,
  });

  if (transaction) {
    res.status(201).json(transaction);
  } else {
    res.status(400);
    throw new Error("Transaction failed");
  }
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
  heroContent,
  aboutContent,
  serviceContent,
  payout,
};
