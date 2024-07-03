const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { JWT_SECRET } = process.env;

const SALT_ROUNDS = 10;

async function register(req, res) {
  console.log("register");
  try {
    const { password, confirmPassword, ...userData } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({
      userData,
      password: hashedPassword,
    });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("register", error.name);
    if (error.code === 11000) {
      console.error("username already exists");
      return res.status(400).json({ error: "User already exists" });
    }
    res.status(500).json({ error: "Registration failed" });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Authentication failed" });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Authentication failed" });
    }
    // Generate JWT token containing user id
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
}

module.exports = { register, login };
