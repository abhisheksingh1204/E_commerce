const express = require("express");
const router = express.Router();
const knex = require("../db/db");

// 1️⃣ Add item to cart
router.post("/", async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;

    if (!user_id || !product_id || !quantity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if item already exists
    const existing = await knex("Cart").where({ user_id, product_id }).first();

    if (existing) {
      // Update quantity
      await knex("Cart")
        .where({ user_id, product_id })
        .update({
          quantity: existing.quantity + quantity,
        });
    } else {
      // Insert new item
      await knex("Cart").insert({ user_id, product_id, quantity });
    }

    res.json({ message: "Item added to cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2️⃣ View cart items for a user
router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const items = await knex("Cart")
      .join("products", "Cart.product_id", "products.id")
      .select(
        "Cart.id",
        "Cart.product_id",
        "products.name",
        "products.image_url",
        "Cart.quantity"
      )
      .where("Cart.user_id", user_id);

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3️⃣ Update quantity of a cart item
router.put("/:user_id/:product_id", async (req, res) => {
  try {
    const { user_id, product_id } = req.params;
    const { quantity } = req.body;

    await knex("Cart").where({ user_id, product_id }).update({ quantity });

    res.json({ message: "Cart item updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4️⃣ Delete an item from cart
router.delete("/:user_id/:product_id", async (req, res) => {
  try {
    const { user_id, product_id } = req.params;

    await knex("Cart").where({ user_id, product_id }).del();

    res.json({ message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5️⃣ Clear all items from a user's cart
router.delete("/clear/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    await knex("Cart").where({ user_id }).del();

    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
