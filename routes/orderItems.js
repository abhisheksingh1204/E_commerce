const express = require("express");
const router = express.Router();
const knex = require("../db/db");

router.post("/", async (req, res) => {
  try {
    const { user_id, order_id, unique_price, quantity } = req.body;
    const newItem = await knex("OrderItems")
      .insert({ user_id, order_id, unique_price, quantity })
      .returning("*");
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const items = await knex("OrderItems").select("*");
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:user_id/:order_id", async (req, res) => {
  try {
    const { user_id, order_id } = req.params;
    const item = await knex("OrderItems").where({ user_id, order_id }).first();

    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:user_id/:order_id", async (req, res) => {
  try {
    const { user_id, order_id } = req.params;
    const { unique_price, quantity } = req.body;

    const updated = await knex("OrderItems")
      .where({ user_id, order_id })
      .update({ unique_price, quantity, updated_at: knex.fn.now() })
      .returning("*");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:user_id/:order_id", async (req, res) => {
  try {
    const { user_id, order_id } = req.params;
    await knex("OrderItems").where({ user_id, order_id }).del();
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
