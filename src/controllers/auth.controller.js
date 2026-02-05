const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

/**
 * Register new user
 */
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    passwordHash
  });

  res.status(201).json({
    message: "User registered successfully",
    userId: user._id
  });
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.blocked) {
    return res.status(403).json({ message: "User is blocked" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  user.lastLogin = new Date();
  await user.save();

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.json({
    message: "Login successful",
    token
  });
};
