const express = require("express");
const router = express.Router();
const knex = require("../db/db");

router.post("/", async (req, res) => {
  try {
    const { Total_amount, quantity, status, payment_method } = req.body;
    const newOrder = await knex("Orders")
      .insert({ Total_amount, quantity, status, payment_method })
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
        status,
        payment_method,
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

module.exports = router;
