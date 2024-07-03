const express = require("express");
const router = express.Router();
const User = require("../models/user.model");

router.get("/", async (req, res) => {
  const { userId } = req;
  const user = await User.findById(userId).exec();
  const { password, ...userWithoutPassword } = user._doc;

  // res.json({ message: `You are accessing protected route ${req.userId}` });
  res.status(200).json(userWithoutPassword);
});

module.exports = router;
