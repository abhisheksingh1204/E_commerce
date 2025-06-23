import express from "express";
const router = express.Router();
import knex from "../db/db.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "shoppinginfo2345@gmail.com",
    pass: "nvef pyes yvyh ndck",
  },
});

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Place a new order with direct details
 *     responses:
 *       200:
 *         description: Order placed and email sent
 *       500:
 *         description: Server error
 */
router.post("/", async (req, res) => {
  try {
    const { Total_amount, quantity, status, payment_method, user_id } =
      req.body;

    const [newOrder] = await knex("Orders")
      .insert({ Total_amount, quantity, status, payment_method, user_id })
      .returning("*");

    const user = await knex("users").where({ id: user_id }).first();

    if (!user || !user.email) {
      return res.status(404).json({ error: "User not found ya email missing" });
    }

    const info = await transporter.sendMail({
      from: '"My Shop" <shoppinginfo2345@gmail.com>',
      to: user.email,
      subject: "Order Confirmation",
      text: `Thank you for your order of ₹${Total_amount}!`,
      html: `<b>We received your order of ₹${Total_amount} successfully.</b>`,
    });

    console.log("Message sent:", info.messageId);

    res.json({
      success: true,
      message: "Order placed and email sent",
      order: newOrder,
      emailId: info.messageId,
    });
  } catch (err) {
    console.error("Order or Email Error:", err.message);
    res.status(500).json({ error: "Order placement ya email bhejne me error" });
  }
});

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of all orders
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
  try {
    const orders = await knex("Orders").select("*");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get a single order by ID
 *     responses:
 *       200:
 *         description: Order found
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const order = await knex("Orders").where({ id: req.params.id }).first();
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update an order
 *     responses:
 *       200:
 *         description: Order updated
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res) => {
  try {
    const { Total_amount, quantity, status, payment_method, user_id } =
      req.body;
    const updated = await knex("Orders")
      .where({ id: req.params.id })
      .update({
        Total_amount,
        quantity,
        payment_method,
        user_id,
        updated_at: knex.fn.now(),
      })
      .returning("*");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete an order by ID
 *     responses:
 *       204:
 *         description: Order deleted
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
  try {
    await knex("Orders").where({ id: req.params.id }).del();
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /orders/place:
 *   post:
 *     summary: Place an order from the user's cart
 *     responses:
 *       200:
 *         description: Order placed and cart cleared
 *       400:
 *         description: Cart is empty
 *       500:
 *         description: Order or email error
 */
router.post("/place", async (req, res) => {
  try {
    const { user_id, payment_method } = req.body;

    // Fetching cart items and product price
    const cartItems = await knex("Cart")
      .join("Products", "Cart.product_id", "Products.id")
      .select("Cart.*", "Products.price")
      .where("Cart.user_id", user_id);

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Step 2: Calculate total amount
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    // Step 3: Insert order into Orders table
    const [order] = await knex("Orders")
      .insert({
        Total_amount: totalAmount,
        quantity: totalQuantity,
        status: "pending", // default status
        payment_method,
        user_id,
      })
      .returning("*");

    await knex("Cart").where({ user_id }).del();
    const user = await knex("users").where({ id: user_id }).first();

    if (!user || !user.email) {
      return res.status(404).json({ error: "User not found ya email missing" });
    }

    const info = await transporter.sendMail({
      from: '"My Shop" <shoppinginfo2345@gmail.com>',
      to: user.email,
      subject: "Order Confirmation",
      text: `Thank you for your order of ₹${totalAmount}!`,
      html: `<b>We received your order of ₹${totalAmount} successfully.</b>`,
    });

    console.log("Message sent:", info.messageId);

    res.json({
      success: true,
      message: "Order placed and email sent",
      order,
      emailId: info.messageId,
    });
  } catch (err) {
    console.error("Order or Email Error:", err.message);
    res.status(500).json({ error: "Error in order or payment" });
  }
});

/**
 * @swagger
 * /orders/history/{user_id}:
 *   get:
 *     summary: Get order history for a specific user
 *     responses:
 *       200:
 *         description: Order history fetched
 *       500:
 *         description: Server error
 */
router.get("/history/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const orders = await knex("Orders")
      .where({ user_id })
      .select("*")
      .orderBy("created_at", "desc");

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
