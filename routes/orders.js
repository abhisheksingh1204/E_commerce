const express = require("express");
const router = express.Router();
const knex = require("../db/db");

// Create new order manually
router.post("/", async (req, res) => {
  try {
    const { Total_amount, quantity, payment_method } = req.body;
    const newOrder = await knex("Orders")
      .insert({ Total_amount, quantity, payment_method })
      .returning("*");
    res.json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await knex("Orders").select("*");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order by ID
router.get("/:id", async (req, res) => {
  try {
    const order = await knex("Orders").where({ id: req.params.id }).first();
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order by ID
router.put("/:id", async (req, res) => {
  try {
    const { Total_amount, quantity, payment_method } = req.body;
    const updated = await knex("Orders")
      .where({ id: req.params.id })
      .update({
        Total_amount,
        quantity,
        payment_method,
        updated_at: knex.fn.now(),
      })
      .returning("*");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete order by ID
router.delete("/:id", async (req, res) => {
  try {
    await knex("Orders").where({ id: req.params.id }).del();
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Place order from cart (example logic)
router.post("/place", async (req, res) => {
  try {
    const { user_id, payment_method } = req.body;

    // Fetch cart items
    const cartItems = await knex("Cart")
      .join("Products", "Cart.product_id", "Products.id")
      .select("Cart.*", "Products.price")
      .where("Cart.user_id", user_id);

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    // Create order
    const [order] = await knex("Orders")
      .insert({
        Total_amount: totalAmount,
        quantity: cartItems.length,
        payment_method,
      })
      .returning("*");

    // Insert into OrderItems
    const orderItemsData = cartItems.map((item) => ({
      user_id,
      order_id: order.id,
      unique_price: item.price,
      quantity: item.quantity,
    }));

    await knex("OrderItems").insert(orderItemsData);

    // Clear cart
    await knex("Cart").where({ user_id }).del();

    res.json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order history for user
router.get("/history/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const orders = await knex("Orders")
      .join("OrderItems", "Orders.id", "OrderItems.order_id")
      .select("Orders.*", "OrderItems.*")
      .where("OrderItems.user_id", user_id);

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
