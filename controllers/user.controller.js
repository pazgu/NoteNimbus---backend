const User = require("../models/user.model");

async function getUserDetails(req, res) {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { username, firstName, lastName, products } = user;
    res.status(200).json({
      username,
      firstName,
      lastName,
      products,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
}

async function getUserProducts(req, res) {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { username, firstName, lastName, products } = user;
    res.status(200).json({
      username,
      firstName,
      lastName,
      products,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  getUserDetails,
  getUserProducts
};
