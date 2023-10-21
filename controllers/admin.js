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

const getContent = asyncHandler(async (req, res) => {
  const content = await Content.findById("652c8c7a7ba8c309c3c8c005");

  res.status(201).json(content);
});

const heroContent = asyncHandler(async (req, res) => {
  const { hero } = req.body;

  console.log(req.body);

  if (!hero) {
    res.status(400);
    throw new Error("Please fill up all required fields.");
  }

  const content = await Content.findByIdAndUpdate(
    "652c8c7a7ba8c309c3c8c005",

    {
      $set: { hero },
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
  const { about } = req.body;

  if (!about) {
    res.status(400);
    throw new Error("Please fill up all required fields.");
  }

  const content = await Content.findByIdAndUpdate(
    "652c8c7a7ba8c309c3c8c005",

    {
      $set: { about },
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

const howContent = asyncHandler(async (req, res) => {
  const { how } = req.body;

  if (!how) {
    res.status(400);
    throw new Error("Please fill up all required fields.");
  }

  const content = await Content.findByIdAndUpdate(
    "652c8c7a7ba8c309c3c8c005",

    {
      $set: { how },
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

const valueContent = asyncHandler(async (req, res) => {
  const { value } = req.body;

  if (!value) {
    res.status(400);
    throw new Error("Please fill up all required fields.");
  }

  const content = await Content.findByIdAndUpdate(
    "652c8c7a7ba8c309c3c8c005",

    {
      $set: { value },
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
    type: "withdrawal",
    plan: type,
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

const filterUserByMonth = asyncHandler(async (req, res) => {
  const { month } = req.body;

  if (!month) {
    res.status(400);
    throw new Error("Please enter month");
  }

  const users = await User.find({ month });

  res.status(201).json({ result: users.length, users });
});

const filterTransactionsByMonth = asyncHandler(async (req, res) => {
  const { month } = req.body;

  if (!month) {
    res.status(400);
    throw new Error("Please enter month");
  }

  const transactions = await Transaction.find({ month });

  res.status(201).json(transactions);
});

const userTransactionHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  const transactions = await Transaction.find({
    userId: user._id,
  }).sort("-createdAt");

  res.status(201).json({ result: transactions.length, transactions });
});

const totalInvestments = asyncHandler(async (req, res) => {
  const totalInvestments = await User.aggregate([
    {
      $group: {
        _id: 1,
        totalInvestments: { $sum: "$accountBalance" },
      },
    },
  ]);
  // const user = await User.findById(req.params.id);

  // if (!user) {
  //   res.status(400);
  //   throw new Error("User not found, please signup");
  // }

  // const transactions = await Transaction.find({
  //   userId: user._id,
  // }).sort("-createdAt");

  res.status(201).json(...totalInvestments);
});

const totalIntrest = asyncHandler(async (req, res) => {
  const totalIntrest = await User.aggregate([
    {
      $group: {
        _id: 1,
        totalIntrest: { $sum: "$intrest" },
      },
    },
  ]);

  res.status(201).json(...totalIntrest);
});

const totalReferrals = asyncHandler(async (req, res) => {
  const totalReferrals = await User.aggregate([
    {
      $group: {
        _id: 1,
        totalReferrals: { $sum: "$referralBonus" },
      },
    },
  ]);

  res.status(201).json(...totalReferrals);
});

const search = asyncHandler(async (req, res) => {
  const searchTerm = req.query.searchTerm;

  if (!searchTerm) {
    res.status(400);
    throw new Error("Please enter search term.");
  }

  const users = await User.find({
    firstname: { $regex: searchTerm, $options: "i" },
  });

  res.status(201).json({ result: users.length, users });
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
  howContent,
  valueContent,
  getContent,
  payout,
  filterTransactionsByMonth,
  filterUserByMonth,
  userTransactionHistory,
  totalInvestments,
  totalIntrest,
  totalReferrals,
  search,
};
