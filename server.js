const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");
const User = require("./models/User");

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch(err => console.log("❌ Connection Error:", err));

// ✅ Registration Route
app.post("/register", async (req, res) => {
  try {
    const { full_name, email, username, password } = req.body;

    // Prevent duplicate username or email
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).send("⚠️ Username or Email already exists.");
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ full_name, email, username, password: hashed });
    await newUser.save();
    res.send("✅ Registration Successful");
  } catch (err) {
    console.error("Error in /register:", err);
    res.status(400).send("❌ Error: " + err.message);
  }
});

// ✅ Login Route
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body; // <-- fixed from email to username

    const user = await User.findOne({ username });
    if (!user) return res.status(404).send("❌ User not found. Please register first.");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send("⚠️ Invalid password. Try again.");

    res.send(`✅ Welcome back, ${user.full_name}!`);
  } catch (err) {
    console.error("Error in /login:", err);
    res.status(400).send("❌ Error: " + err.message);
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
