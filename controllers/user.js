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

const generateToken = (id, username) => {
  return jwt.sign({ id, username }, process.env.JWT_SECRET);
};
// new commit
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
  });

  // // Generate token
  // const token = generateToken(user._id, user.name);

  // //Send HTTP-only cookie
  // res.cookie("token", token, {
  //   path: "/",
  //   httpOnly: true,
  //   expires: new Date(Date.now() + 1000 * 86400),
  //   sameSite: "none",
  //   secure: true,
  // });

  if (user) {
    res.status(201).json({ ...user._doc });
    //   let token = await Token.findOne({ userId: user._id });
    //   if (token) {
    //     await token.deleteOne();
    //   }
    //   let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

    //   const hashToken = crypto
    //     .createHash("sha256")
    //     .update(resetToken)
    //     .digest("hex");

    //   await new Token({
    //     userId: user._id,
    //     token: hashToken,
    //     createdAt: Date.now(),
    //     expiresAt: Date.now() + 30 * (60 * 1000),
    //   }).save();

    //   const resetLink = `${process.env.FRONTEND_URL}/add-kyc/${resetToken}`;
    //   const message = `
    // <h2>Hi ${user.name}</h2>
    // <p>Thank you for sign up to honey comb, Please use the url below to continue</p>
    // <p>This link expires in 30 minutes</p>
    // <a href=${resetLink} clicktracking=off>${resetLink}</a>
    // <h6>Honey comb fxd</h6>
    // `;
    //   const subject = "Welcom to Honey-comb-fxd";
    //   const send_to = user.email;
    //   const send_from = process.env.EMAIL_USER;

    // try {
    //   await sendEmail(subject, message, send_to, send_from);
    //   res.status(201).json({ ...user._doc });
    // } catch (error) {
    //   res.status(500);
    //   throw new Error("Email not sent , Please try Again.");
    // }
  } else {
    res.status(400);
    throw new Error("Unable to register user , Please try again");
  }
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

const addDocument = asyncHandler(async (req, res) => {
  const { idType } = req.body;

  if (!idType) {
    res.status(400);
    throw new Error("Please fill up all required fields.");
  }

  let fileData = {};

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
  const {
    firstname,
    lastname,
    email,
    address,
    DOB,
    phone,
    accountNumber,
    bank,
  } = req.body;

  if (
    !firstname ||
    !lastname ||
    !email ||
    !address ||
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
          email,
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
    return res.json(true);
  } else {
    return res.json(fasle);
  }
});

const invest = asyncHandler(async (req, res) => {
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

  const oldBalance = user.accountBalance;
  const currentBalance = user.accountBalance + amount;

  const newUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { accountBalance: currentBalance },
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
    currentBalance: newUser.accountBalance,
    oldBalance,
    month,
  });

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

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({}).sort("-createdAt");

  res.status(201).json({ result: notifications.length, notifications });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  res.status(200).json(user);
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

module.exports = {
  registerUser,
  loginUser,
  addDocument,
  updateUser,
  loginStatus,
  invest,
  transactionHistory,
  getNotifications,
  getUser,
  filterTransactionsByMonth,
  uploadPicture,
};
