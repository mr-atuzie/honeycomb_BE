const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { fileSizeFormatter } = require("../utils/fileUpload");
const Token = require("../models/Token");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const Transaction = require("../models/Transaction");
const Notification = require("../models/Notification");
const Withdraw = require("../models/Withdraw");
const Referral = require("../models/Referrals");
const Content = require("../models/Content");
const Investment = require("../models/Investment");

const generateToken = (id, username) => {
  return jwt.sign({ id, username }, process.env.JWT_SECRET);
};

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

const registerUser = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, password, referral } = req.body;

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

  //Create verification Code
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  function generateString(length) {
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  const verificationCode = generateString(8);

  const user = await User.create({
    firstname,
    lastname,
    email,
    month,
    password: hashPassword,
    verificationCode: verificationCode,
  });

  // Generate token
  const token = generateToken(user._id, user.name);

  // Send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400),
    sameSite: "none",
    secure: true,
  });

  // if user has a referral
  if (referral) {
    const referredBy = await User.findById(referral);

    if (!referredBy) {
      res.status(400);
      throw new Error("Invalid referral code");
    }

    const bonus = referredBy.referralBonus + 500;

    await User.findByIdAndUpdate(
      referral,
      {
        $set: {
          referralBonus: bonus,
        },
      },
      {
        new: true,
      }
    );

    const name = `${user.firstname} ${user.lastname}`;

    await Referral.create({
      userId: referredBy._id,
      name,
      referred: user._id,
      email: user.email,
      amount: bonus,
      date: Date.now(),
    });
  }

  if (user) {
    // let token = await Token.findOne({ userId: user._id });

    // if (token) {
    //   await token.deleteOne();
    // }

    // let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

    // const hashToken = crypto
    //   .createHash("sha256")
    //   .update(resetToken)
    //   .digest("hex");

    // await new Token({
    //   userId: user._id,
    //   token: verificationCode,
    //   createdAt: Date.now(),
    //   expiresAt: Date.now() + 30 * (60 * 1000),
    // }).save();

    // const resetLink = `${process.env.FRONTEND_URL}/verify-email/${resetToken}`;
    // <a href=${resetLink} style="color: green; font-size: 16px;" clicktracking=off>Verify Email</a>
    const message = `
    
    <h2 style="color: green;">Welcome ${user.firstname}</h2>
    
    <p style="font-size: 13px;">Empower your financial future with Honeycombfxd farm,Invest confidently, stay informed, and take control of your wealth, all in one place.</p>
   
    <p>Your email verification is</p>
   
    <h1 style="color: green;"> ${verificationCode}</h1>

    <h5 style="color: gold;">Honey comb fxd farm</h5>
    `;
    const subject = "Email Confirmation";
    const send_to = user.email;
    const send_from = process.env.EMAIL_USER;

    try {
      await sendEmail(subject, message, send_to, send_from);
      res.status(201).json({ ...user._doc });
    } catch (error) {
      res.status(500);
      throw new Error("Email not sent , Please try Again.");
    }
  } else {
    res.status(400);
    throw new Error("Unable to register user , Please try again");
  }
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationCode } = req.body;
  const user = await User.findById(req.user._id);

  if (!verificationCode) {
    res.status(400);
    throw new Error("Please enter a valid code");
  }

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  if (user.verificationCode != verificationCode) {
    res.status(400);
    throw new Error("Please enter a valid code");
  }
  // const { resetToken } = req.params;

  // const hashToken = crypto
  //   .createHash("sha256")
  //   .update(resetToken)
  //   .digest("hex");

  // const userToken = await Token.findOne({
  //   userId: user._id,
  //   expiresAt: { $gt: Date.now() },
  // });

  // if (!userToken) {
  //   res.status(404);
  //   throw new Error("Invalid or Expired Token.");
  // }

  const newUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        verifyEmail: true,
        verificationCode: "verified",
      },
    },
    {
      new: true,
    }
  );

  res
    .status(200)
    .json({ msg: "Email verification successfull", user: newUser });
});

const loginUser = asyncHandler(async (req, res) => {
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

  if (!user.verifyEmail) {
    res.status(400);
    throw new Error("Invalid email");
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

const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  //Valid Request
  if (!email) {
    res.status(400);
    throw new Error("Please fill up all required fields.");
  }

  //Check if user exist
  const user = await User.findOne({ email: email });

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  if (!user.verifyEmail) {
    res.status(400);
    throw new Error("Invalid email");
  }

  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  function generateString(length) {
    let result = " ";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  const newPassword = generateString(7);

  //Hash user password..
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(newPassword, salt);

  await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        password: hashPassword,
      },
    },
    {
      new: true,
    }
  );

  const message = `
  <h2>Hi ${user.firstname}</h2>
  <p>Your new password is ${newPassword}</p>
  
  <h6>Honey comb fxd</h6>
  `;
  const subject = "Forgot Password";
  const send_to = user.email;
  const send_from = process.env.EMAIL_USER;

  try {
    await sendEmail(subject, message, send_to, send_from);
    res.status(201).json({ ...user._doc });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent , Please try Again.");
  }
});

const addDocument = asyncHandler(async (req, res) => {
  const { idType } = req.body;

  let fileData = {};

  if (!idType) {
    res.status(400);
    throw new Error("Please fill up all required fields.");
  }

  if (!req.file) {
    res.status(400);
    throw new Error("This file cannot be accepted");
  }

  if (req.file) {
    let uploadedFile;

    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Houses",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      res.send(error);
      throw new Error("Unable to upload image, Please try again.");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size),
    };
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        document: { idType, image: fileData.filePath },
        kycStatus: "pending",
      },
    },
    {
      new: true,
    }
  );

  res.status(200).json(user);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { firstname, lastname, address, DOB, phone, accountNumber, bank } =
    req.body;

  if (
    !firstname ||
    !lastname | !address ||
    !DOB ||
    !phone ||
    !accountNumber ||
    !bank
  ) {
    res.status(400);
    throw new Error("Please fill up all required fields.");
  }

  //Check password length
  if (accountNumber.length < 10) {
    res.status(400);
    throw new Error("incorrect account Number");
  }

  if (user) {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          firstname,
          lastname,
          DOB,
          address,
          phone,
          accountNumber,
          bank,
        },
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      user,
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json(false);
  }

  const verified = jwt.verify(token, process.env.JWT_SECRET);

  if (verified) {
    res.json(true);
  } else {
    return res.json(fasle);
  }
});

const lowRiskInvestment = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { amount, type, duration } = req.body;

  // console.log({ amount: parseInt(amount), type, duration: parseInt(duration) });

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  if (!amount || !type || !duration) {
    res.status(400);
    throw new Error("Unable to complete transaction");
  }

  if (parseInt(amount) < 100000) {
    res.status(400);
    throw new Error("Minimum amount for investment is 100,000");
  }

  // //Find Pay out date
  const currentDate = new Date();
  const durationInMonths = parseInt(duration) * 30;
  const maturity = currentDate.setDate(
    currentDate.getDate() + durationInMonths
  );

  const intrestPerMonth = parseInt(amount) * 0.03;
  const payout = intrestPerMonth * parseInt(duration);
  const totalPayout = parseInt(amount) + payout;

  const currentBalance = user.accountBalance + parseInt(amount);
  const currentIntrest = user.intrest + payout;

  const newUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { accountBalance: currentBalance, intrest: currentIntrest },
    },
    {
      new: true,
    }
  );

  const name = `${user.firstname} ${user.lastname}`;

  const transaction = await Transaction.create({
    userId: user._id,
    name,
    email: user.email,
    type: "credit",
    plan: type,
    amount,
    date: Date.now(),
    month,
  });

  const investment = await Investment.create({
    userId: user._id,
    name,
    email: user.email,
    type,
    amount,
    intrest: intrestPerMonth,
    payout,
    maturity,
  });

  res.status(201).json({
    newUser,
    investment,
    transaction,
  });
});

const highRiskInvestment = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { amount, type } = req.body;

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  if (!amount || !type) {
    res.status(400);
    throw new Error("Unable to complete transaction");
  }

  if (amount < 100000) {
    res.status(400);
    throw new Error("Minimum amount for investment is 100,000");
  }

  //Find Pay out date
  const currentDate = new Date();
  const duration = 7;
  const maturity = currentDate.setDate(currentDate.getDate() + duration);

  //collect reg fee
  const regFee = parseInt(amount) * 0.05;
  const amountAfterDeduct = parseInt(amount) - regFee;

  const intrestPerWeek = amountAfterDeduct * 0.15;
  const investmentReturn = amountAfterDeduct / 4;

  const payout = investmentReturn + intrestPerWeek;

  const currentBalance = user.accountBalance + amountAfterDeduct;
  const currentIntrest = user.intrest + payout;

  const newUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { accountBalance: currentBalance, intrest: currentIntrest },
    },
    {
      new: true,
    }
  );

  const name = `${user.firstname} ${user.lastname}`;

  const transaction = await Transaction.create({
    userId: user._id,
    name,
    email: user.email,
    type: "credit",
    plan: type,
    amount,
    date: Date.now(),
    month,
  });

  await Transaction.create({
    userId: user._id,
    name,
    email: user.email,
    type: "registration fee",
    plan: type,
    amount: regFee,
    date: Date.now(),
    month,
  });

  const investment = await Investment.create({
    userId: user._id,
    name,
    email: user.email,
    type,
    amount: amountAfterDeduct,
    intrest: intrestPerWeek,
    payout,
    maturity,
  });

  res.status(201).json({
    newUser,
    investment,
    transaction,
  });

  // if (transaction) {
  //   res.status(201).json(transaction);
  // } else {
  //   res.status(400);
  //   throw new Error("Transaction failed");
  // }
});

const withdraw = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const id = req.params.id;

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  const investment = await Investment.findById(id);

  if (!investment) {
    res.status(400);
    throw new Error("Not allowed");
  }

  const transaction = await Investment.findByIdAndUpdate(
    investment._id,
    {
      $set: { status: "withdraw" },
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

const transactionHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  const transactions = await Transaction.find({
    userId: user._id,
  }).sort("-createdAt");

  res.status(201).json({ result: transactions.length, transactions });
});

const userWithdrawals = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  const transactions = await Investment.find({
    userId: user._id,
  }).sort("-createdAt");

  res.status(201).json({ result: transactions.length, transactions });
});

const userReferrals = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  const referrals = await Referral.find({
    userId: user._id,
  }).sort("-createdAt");

  res.status(201).json({ result: referrals.length, referrals });
});

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({}).sort("-createdAt");

  res.status(201).json({ result: notifications.length, notifications });
});

const getNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  res.status(201).json(notification);
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  res.status(200).json(user);
});

const userInvestments = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  const investments = await Investment.find({
    userId: user._id,
  }).sort("-createdAt");

  res.status(201).json({ result: investments.length, investments });
});

const userInvestment = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  const investment = await Investment.findById(req.params.id);

  res.status(201).json(investment);
});

const filterTransactionsByMonth = asyncHandler(async (req, res) => {
  const { month } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  if (!month) {
    res.status(400);
    throw new Error("Please enter month");
  }

  const transactions = await Transaction.find({ userId: user._id, month });

  res.status(201).json(transactions);
});

const uploadPicture = asyncHandler(async (req, res) => {
  let fileData = {};

  if (!req.file) {
    res.status(400);
    throw new Error("This file cannot be accepted");
  }

  if (req.file) {
    let uploadedFile;

    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Houses",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      res.send(error);
      throw new Error("Unable to upload image, Please try again.");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size),
    };
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { photo: fileData.filePath } },
    {
      new: true,
    }
  );

  res.status(200).json(user);
});

const getContent = asyncHandler(async (req, res) => {
  const content = await Content.findById(process.env.CONTENT);
  res.status(201).json(content);
});

const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });

  return res.status(200).json({
    success: true,
    message: "Log out Successful",
  });
});

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  addDocument,
  updateUser,
  loginStatus,
  lowRiskInvestment,
  withdraw,
  transactionHistory,
  getNotifications,
  getUser,
  filterTransactionsByMonth,
  uploadPicture,
  userWithdrawals,
  userReferrals,
  getNotification,
  getContent,
  highRiskInvestment,
  userInvestments,
  userInvestment,
  forgetPassword,
  logout,
};
