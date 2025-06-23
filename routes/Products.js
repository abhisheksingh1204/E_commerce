import express from "express";
const router = express.Router();
import knex from "../db/db.js";
import upload from "../middleware/upload.js";

/**
 * @swagger
 * /products/image:
 *   post:
 *     summary: Add a new product with image upload
 *     responses:
 *       201:
 *         description: Product created with image
 *       500:
 *         description: Server error
 */
router.post("/image", upload.single("image"), async (req, res) => {
  const { name, price, stock_quantity } = req.body;
  const image_url = req.file ? req.file.filename : null;

  const [product] = await knex("Products")
    .insert({ name, price, stock_quantity, image_url })
    .returning("*");

  res.json(product);
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Add a new product (without image upload)
 *     responses:
 *       200:
 *         description: Product added
 *       500:
 *         description: Server error
 */
router.post("/", async (req, res) => {
  try {
    const { name, price, stock_quantity, image_url } = req.body;
    const newProduct = await knex("Products")
      .insert({ name, price, stock_quantity, image_url })
      .returning("*");
    res.json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products (with optional search)
 *     responses:
 *       200:
 *         description: List of products
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
  try {
    const search = req.query.search || "";
    const products = await knex("Products").whereILike("name", `%${search}%`);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     responses:
 *       200:
 *         description: Product updated
 *       500:
 *         description: Server error
 */
router.put("/:id", async (req, res) => {
  try {
    const { name, price, stock_quantity, image_url } = req.body;
    const updated = await knex("Products")
      .where({ id: req.params.id })
      .update({
        name,
        price,
        stock_quantity,
        image_url,
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
 * /products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     responses:
 *       204:
 *         description: Product deleted
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
  try {
    await knex("Products").where({ id: req.params.id }).del();
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
export default router;
