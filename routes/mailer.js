const express = require("express");
const router = express.Router();
const knex = require("../db/db"); // apne knex file ka path lagao
const nodemailer = require("nodemailer");

// 1. Setup transporter (ye ek baar hi banega, baar baar nahi)
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "shoppinginfo2345@gmail.com",
    pass: "nvef pyes yvyh ndck",
  },
});

// 2. API Route
router.get("/send-email/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    // Step 1: DB se user ki email lao
    const user = await knex("users").where({ id: userId }).first();

    if (!user || !user.email) {
      return res.status(404).json({ error: "User not found ya email missing" });
    }

    // Step 2: Email bhejo
    const info = await transporter.sendMail({
      from: '"My Shop" <shoppinginfo2345@gmail.com>',
      to: user.email,
      subject: "Order Confirmation",
      text: "Thank you for your order!",
      html: "<b>We received your order successfully.</b>",
    });

    console.log("Message sent:", info.messageId);

    res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error("Error sending email:", err.message);
    res.status(500).json({ error: "Email failed" });
  }
});

module.exports = router;
