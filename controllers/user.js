const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { fileSizeFormatter } = require("../utils/fileUpload");
const Token = require("../models/Token");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const generateToken = (id, username) => {
  return jwt.sign({ id, username }, process.env.JWT_SECRET);
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
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
    name,
    email,
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
    let token = await Token.findOne({ userId: user._id });
    if (token) {
      await token.deleteOne();
    }
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

    const hashToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await new Token({
      userId: user._id,
      token: hashToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * (60 * 1000),
    }).save();

    const resetLink = `${process.env.FRONTEND_URL}/add-kyc/${resetToken}`;
    const message = `
  <h2>Hi ${user.name}</h2>
  <p>Thank you for sign up to honey comb, Please use the url below to continue</p>
  <p>This link expires in 30 minutes</p>
  <a href=${resetLink} clicktracking=off>${resetLink}</a>
  <h6>Honey comb fxd</h6>
  `;
    const subject = "Welcom to Honey-comb-fxd";
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
    throw new Error("Incorrect password");
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
  const { idType, idNumber } = req.body;

  if (!idType || !idNumber) {
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
    { $set: { document: { idType, idNumber, image: fileData } } },
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
};
