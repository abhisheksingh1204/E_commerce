import express from "express";
const router = express.Router();
import knex from "../db/db.js";
import multer from "multer";
const upload = multer();

/**
 * @openapi
 * /cart/Add to cart:
 *   post:
 *     summary: Add item to cart
 *     tags:
 *       - Cart
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - product_id
 *               - quantity
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID of the user
 *               product_id:
 *                 type: integer
 *                 description: ID of the product to add
 *               quantity:
 *                 type: integer
 *                 description: Quantity of the product
 *     responses:
 *       200:
 *         description: Item added to cart and stock updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item added and stock updated
 *       400:
 *         description: Missing required fields or insufficient stock
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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
router.post("/Add to cart", upload.none(), async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;
    const qty = Number(quantity);

    if (!user_id || !product_id || !qty)
      return res.status(400).json({ error: "Missing required fields" });

    const product = await knex("Products").where({ id: product_id }).first();
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.stock_quantity < qty)
      return res.status(400).json({ error: "Not enough stock" });

    const existing = await knex("Cart").where({ user_id, product_id }).first();

    if (existing) {
      const updatedQty = existing.quantity + qty;
      if (product.stock_quantity < updatedQty - existing.quantity)
        return res.status(400).json({ error: "Not enough stock" });

      await knex("Cart")
        .where({ user_id, product_id })
        .update({ quantity: updatedQty });
    } else {
      await knex("Cart").insert({ user_id, product_id, quantity: qty });
    }

    await knex("Products")
      .where({ id: product_id })
      .decrement("stock_quantity", qty);

    res.json({ message: "Item added and stock updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /cart/{user_id}:
 *   get:
 *     summary: Get all cart items for a user
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user whose cart items to retrieve
 *     responses:
 *       200:
 *         description: List of cart items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   product_id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   image_url:
 *                     type: string
 *                   quantity:
 *                     type: integer
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
 * @openapi
 * /cart/{user_id}/{product_id}:
 *   put:
 *     summary: Update quantity of a cart item
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product in cart
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: Updated quantity
 *     responses:
 *       200:
 *         description: Cart item updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       400:
 *         description: Missing quantity value
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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
router.put("/:user_id/:product_id", upload.none(), async (req, res) => {
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
 * @openapi
 * /cart/clear/{user_id}:
 *   delete:
 *     summary: Clear all items from a user's cart
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user whose cart is to be cleared
 *     responses:
 *       200:
 *         description: Cart cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
router.delete("/clear/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    await knex("Cart").where({ user_id }).del();

    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /cart/{user_id}/{product_id}:
 *   delete:
 *     summary: Remove item from cart
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to remove from cart
 *     responses:
 *       200:
 *         description: Item removed from cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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
router.delete("/:user_id/:product_id", async (req, res) => {
  try {
    const { user_id, product_id } = req.params;

    await knex("Cart").where({ user_id, product_id }).del();

    res.json({ message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
