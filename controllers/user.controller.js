const User = require("../models/user.model");

async function getUserDetails(req, res) {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId).select("-password"); // Exclude the password field
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  getUserDetails,
};
