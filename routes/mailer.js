const express = require("express");
const router = express.Router();
const knex = require("../db/db");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "shoppinginfo2345@gmail.com",
    pass: "nvef pyes yvyh ndck",
  },
});

router.get("/send-email/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await knex("users").where({ id: userId }).first();

    if (!user || !user.email) {
      return res.status(404).json({ error: "User not found ya email missing" });
    }

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
