const express = require("express");
const router = express.Router();
const db = require("../db/db");

const { register, login } = require("../controllers/authController");
router.post("/register", register);
router.post("/login", login);

router.get("/", async (req, res) => {
  try {
    const users = await db("users").select("id", "name", "email");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

module.exports = router;
