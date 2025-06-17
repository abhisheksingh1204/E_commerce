const express = require("express");
const router = express.Router();
const knex = require("../db/db");

router.post("/", async (req, res) => {
  try {
    const { Total_amount, quantity, status, payment_method, user_id } =
      req.body;
    const newOrder = await knex("Orders")
      .insert({ Total_amount, quantity, status, payment_method, user_id })
      .returning("*");
    res.json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const orders = await knex("Orders").select("*");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const order = await knex("Orders").where({ id: req.params.id }).first();
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { Total_amount, quantity, status, payment_method } = req.body;
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

router.delete("/:id", async (req, res) => {
  try {
    await knex("Orders").where({ id: req.params.id }).del();
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/place", async (req, res) => {
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

    const [order] = await knex("Orders")
      .insert({
        Total_amount: totalAmount,
        quantity: cartItems.length,
        payment_method,
      })
      .returning("*");

    const orderItemsData = cartItems.map((item) => ({
      user_id,
      order_id: order.id,
      unique_price: item.price,
      quantity: item.quantity,
    }));

    await knex("OrderItems").insert(orderItemsData);

    await knex("Cart").where({ user_id }).del();

    res.json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
