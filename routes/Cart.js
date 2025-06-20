const express = require("express");
const router = express.Router();
const knex = require("../db/db");

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add item to cart
 *     responses:
 *       200:
 *         description: Item added to cart
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post("/", async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;

    if (!user_id || !product_id || !quantity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await knex("Cart").where({ user_id, product_id }).first();

    if (existing) {
      await knex("Cart")
        .where({ user_id, product_id })
        .update({
          quantity: existing.quantity + quantity,
        });
    } else {
      await knex("Cart").insert({ user_id, product_id, quantity });
    }

    res.json({ message: "Item added to cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /cart/{user_id}:
 *   get:
 *     summary: Get all cart items for a user
 *     responses:
 *       200:
 *         description: List of cart items
 *       500:
 *         description: Server error
 */
router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const items = await knex("Cart")
      .join("Products", "Cart.product_id", "Products.id")
      .select(
        "Cart.id",
        "Cart.product_id",
        "Products.name",
        "Products.image_url",
        "Cart.quantity"
      )
      .where("Cart.user_id", user_id);

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /cart/{user_id}/{product_id}:
 *   put:
 *     summary: Update quantity of a cart item
 *     responses:
 *       200:
 *         description: Cart item updated
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /cart/{user_id}/{product_id}:
 *   delete:
 *     summary: Remove item from cart
 *     responses:
 *       200:
 *         description: Item removed from cart
 *       500:
 *         description: Server error
 */
router.delete("/:user_id/:product_id", async (req, res) => {
  try {
    const { user_id, product_id } = req.params;

    await knex("Cart").where({ user_id, product_id }).del();

    res.json({ message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /cart/clear/{user_id}:
 *   delete:
 *     summary: Clear all items from a user's cart
 *     responses:
 *       200:
 *         description: Cart cleared
 *       500:
 *         description: Server error
 */
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
