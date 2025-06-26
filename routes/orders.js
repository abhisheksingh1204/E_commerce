import express from "express";
const router = express.Router();
import knex from "../db/db.js";
import nodemailer from "nodemailer";
import multer from "multer";
const upload = multer();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "shoppinginfo2345@gmail.com",
    pass: "nvef pyes yvyh ndck",
  },
});

/**
 *  @openapi
 *  /orders:
 *   post:
 *     summary: Place a new order with direct details
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - Total_amount
 *               - quantity
 *               - status
 *               - payment_method
 *               - user_id
 *             properties:
 *               Total_amount:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               status:
 *                 type: string
 *               payment_method:
 *                 type: string
 *               user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Order placed and email sent
 *       500:
 *         description: Server error
 */
router.post("/", upload.none(), async (req, res) => {
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
 * @openapi
 * /orders:
 *   get:
 *     summary: Get all orders
 *     tags:
 *       - Orders
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   Total_amount:
 *                     type: number
 *                   quantity:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   payment_method:
 *                     type: string
 *                   user_id:
 *                     type: integer
 *                   created_at:
 *                     type: string
 *                     format: date-time
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
 * @openapi
 * /orders/{id}:
 *   put:
 *     summary: Update an order
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the order to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - Total_amount
 *               - quantity
 *               - payment_method
 *               - user_id
 *             properties:
 *               Total_amount:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               status:
 *                 type: string
 *               payment_method:
 *                 type: string
 *               user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Order updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 Total_amount:
 *                   type: number
 *                 quantity:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 payment_method:
 *                   type: string
 *                 user_id:
 *                   type: integer
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 */
router.put("/:id", upload.none(), async (req, res) => {
  try {
    const { Total_amount, quantity, status, payment_method, user_id } =
      req.body;
    const updated = await knex("Orders")
      .where({ id: req.params.id })
      .update({
        Total_amount,
        quantity,
        status,
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
 * @openapi
 * /orders/{id}:
 *   delete:
 *     summary: Delete an order by ID
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the order to delete
 *     responses:
 *       204:
 *         description: Order deleted successfully (No Content)
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
  try {
    await knex("Orders").where({ id: req.params.id }).del();
    res.sendStatus(204); // No Content
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /orders/place:
 *   post:
 *     summary: Place an order from the user's cart
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - payment_method
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID of the user placing the order
 *               payment_method:
 *                 type: string
 *                 description: Method of payment (e.g., "card", "cod", etc.)
 *     responses:
 *       200:
 *         description: Order placed and cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 order:
 *                   type: object
 *                 emailId:
 *                   type: string
 *       400:
 *         description: Cart is empty
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Order or email error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post("/place", upload.none(), async (req, res) => {
  try {
    const { user_id, payment_method } = req.body;

    const cartItems = await knex("Cart")
      .join("Products", "Cart.product_id", "Products.id")
      .select("Cart.*", "Products.price")
      .where("Cart.user_id", user_id);

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const [order] = await knex("Orders")
      .insert({
        Total_amount: totalAmount,
        quantity: totalQuantity,
        status: "pending",
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
 * @openapi
 * /orders/history/{user_id}:
 *   get:
 *     summary: Get order history for a specific user
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to fetch order history for
 *     responses:
 *       200:
 *         description: Order history fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   Total_amount:
 *                     type: number
 *                   quantity:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   payment_method:
 *                     type: string
 *                   user_id:
 *                     type: integer
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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
