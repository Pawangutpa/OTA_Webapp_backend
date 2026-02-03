const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (await User.findOne({ email }))
    return res.status(400).json({ message: "User exists" });

  const user = await User.create({
    username,
    email,
    passwordHash: await bcrypt.hash(password, 10)
  });

  res.json(user);
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ message: "Not found" });

  const ok = await bcrypt.compare(req.body.password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  );

  res.json({ token });
});

module.exports = router;
