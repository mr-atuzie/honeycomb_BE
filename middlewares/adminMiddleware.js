const asyncHandler = require("express-async-handler");

const isAdmin = asyncHandler(async (req, res, next) => {
  const user = req.user;

  if (!user.admin) {
    res.status(401);
    throw new Error("Unauthorized request");
  }

  next();
});

module.exports = isAdmin;
