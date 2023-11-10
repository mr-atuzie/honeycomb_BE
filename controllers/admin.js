const Content = require("../models/Content");
const Notification = require("../models/Notification");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const Withdraw = require("../models/Withdraw");
const Investment = require("../models/Investment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const d = new Date();
let month = months[d.getMonth()];

const generateToken = (id, username) => {
  return jwt.sign({ id, username }, process.env.JWT_SECRET);
};

const getAllTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({}).sort("-createdAt");

  res.status(201).json({ result: transactions.length, transactions });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ admin: false }).sort("-createdAt");

  res.status(201).json({ result: users.length, users });
});

const getInvestment = asyncHandler(async (req, res) => {
  const investment = await Investment.findById(req.params.id);

  res.status(201).json(investment);
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

const getAllPendingWithdraws = asyncHandler(async (req, res) => {
  const withdraws = await Investment.find({ status: "withdraw" }).sort(
    "-createdAt"
  );

  res.status(201).json({ result: withdraws.length, withdraws });
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
  const { hero } = req.body;

  console.log(req.body);

  if (!hero) {
    res.status(400);
    throw new Error("Please fill up all required fields.");
  }
  const content = await Content.findByIdAndUpdate(
    process.env.CONTENT,
    {
      $set: { hero },
    },

    {
      new: true,
    }
  );

  // const content = await Content.create({
  //   hero: hero,
  // });

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
    process.env.CONTENT,
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
    process.env.CONTENT,

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
    process.env.CONTENT,
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
  const investment = await Investment.findById(req.params.id);
  const payer = await User.findById(req.user._id);
  const payee = await User.findById(investment.userId);

  if (!investment) {
    res.status(400);
    throw new Error("Unable to complete transaction");
  }

  const currentIntrest = payee.intrest - investment.payout;

  await User.findByIdAndUpdate(
    payee._id,
    {
      $set: { intrest: currentIntrest },
    },
    {
      new: true,
    }
  );

  const name = `Admin-${payer.firstname} ${payer.lastname}`;
  const payout = investment.payout + investment.amount;

  const transaction = await Transaction.create({
    userId: payee._id,
    name,
    email: payer.email,
    type: "payout",
    plan: investment.type,
    amount: payout,
    date: Date.now(),
    month: month,
  });

  await Investment.findByIdAndUpdate(
    investment._id,
    {
      $set: {
        status: "approved",
        paid: payout,
      },
    },

    {
      new: true,
    }
  );

  if (transaction) {
    res.status(201).json(transaction);
  } else {
    res.status(400);
    throw new Error("Transaction failed");
  }
});

const highpayout = asyncHandler(async (req, res) => {
  const investment = await Investment.findById(req.params.id);
  const payer = await User.findById(req.user._id);
  const payee = await User.findById(investment.userId);

  if (!investment) {
    res.status(400);
    throw new Error("Unable to complete transaction");
  }

  //Find Pay out date
  const currentDate = new Date();
  const duration = 7;
  const maturity = currentDate.setDate(currentDate.getDate() + duration);

  // const currentBalance = payee.accountBalance - investment.payout;
  const currentIntrest = payee.intrest - investment.payout;

  await User.findByIdAndUpdate(
    payee._id,
    {
      $set: { accountBalance: currentBalance, intrest: currentIntrest },
    },
    {
      new: true,
    }
  );

  const name = `Admin-${payer.firstname} ${payer.lastname}`;

  const payout = investment.payout;

  const transaction = await Transaction.create({
    userId: payee._id,
    name,
    email: payer.email,
    type: "payout",
    plan: investment.type,
    amount: payout,
    date: Date.now(),
    month: month,
  });

  // //Update Withdraw
  // const withdrawReq = await Withdraw.find({ userId: payee._id });#
  const paid = investment.paid + payout;

  await Investment.findByIdAndUpdate(
    investment._id,
    {
      $set: {
        status: "",
        maturity: maturity,
        paid: paid,
      },
    },

    {
      new: true,
    }
  );

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

const userInvestments = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  const investments = await Investment.find({
    userId: user._id,
  }).sort("-createdAt");

  res.status(201).json({ result: investments.length, investments });
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

const registerAdmin = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  if (!firstname || !lastname || !email || !password) {
    res.status(400);
    throw new Error("Please fill up all required fields.");
  }

  //Check password length
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be up to 6 characters.");
  }

  //Check if user already exist
  const checkEmail = await User.findOne({ email });

  if (checkEmail) {
    res.status(400);
    throw new Error("Email has already been register.");
  }

  //Hash user password..
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    firstname,
    lastname,
    email,
    month,
    password: hashPassword,
    admin: true,
    verifyEmail: true,
  });

  if (user) {
    res.status(201).json({ ...user._doc });
  } else {
    res.status(400);
    throw new Error("Unable to register user , Please try again");
  }
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  //Valid Request
  if (!email || !password) {
    res.status(400);
    throw new Error("Please fill up all required fields.");
  }

  //Check if user exist
  const user = await User.findOne({ email: email });

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  if (!user.admin) {
    res.status(400);
    throw new Error("Not Allowed");
  }

  //Check if password is valid
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    res.status(400);
    throw new Error("Incorrect email or password");
  }

  //Generate Token
  const token = generateToken(user._id, user.name);

  //Send HTTP-only
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400),
    sameSite: "none",
    secure: true,
  });

  //Send Response
  if (user && checkPassword) {
    res.status(200).json({
      ...user._doc,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid login credentials");
  }
});

module.exports = {
  updateNotification,
  deleteNotification,
  addNotification,
  disapproveKyc,
  approveKyc,
  getAllPendingKyc,
  getAllPendingWithdraws,
  getAllUsers,
  getAllTransactions,
  getUser,
  heroContent,
  aboutContent,
  howContent,
  valueContent,
  getInvestment,
  payout,
  filterTransactionsByMonth,
  filterUserByMonth,
  userTransactionHistory,
  userInvestments,
  totalInvestments,
  totalIntrest,
  totalReferrals,
  search,
  registerAdmin,
  loginAdmin,
  highpayout,
};
