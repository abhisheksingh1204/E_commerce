import express from "express";
const router = express.Router();
import knex from "../db/db.js";
import upload from "../middleware/upload.js";

/**
 * @openapi
 * /products/image:
 *   post:
 *     summary: Add a new product with image upload
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock_quantity
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the product
 *               price:
 *                 type: number
 *                 description: Price of the product
 *               stock_quantity:
 *                 type: integer
 *                 description: Quantity in stock
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Product image file
 *     responses:
 *       201:
 *         description: Product created with image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *                 stock_quantity:
 *                   type: integer
 *                 image_url:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.post("/image", upload.single("image"), async (req, res) => {
  const { name, price, stock_quantity } = req.body;
  const image_url = req.file ? req.file.filename : null;

  const [product] = await knex("Products")
    .insert({ name, price, stock_quantity, image_url })
    .returning("*");

  res.status(201).json(product);
});

/**
 * @openapi
 * /products/{name}:
 *   get:
 *     summary: Get product(s) by exact name
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the product to retrieve
 *     responses:
 *       200:
 *         description: Product(s) matching the given name
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   price:
 *                     type: number
 *                   stock_quantity:
 *                     type: integer
 *                   image_url:
 *                     type: string
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
router.get("/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const products = await knex("Products").where({ name });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               stock_quantity:
 *                 type: integer
 *               image_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated
 *       500:
 *         description: Server error
 */
router.put("/:id", upload.none(), async (req, res) => {
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
 * @openapi
 * /products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to delete
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Product deleted
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await knex("Products").where({ id: req.params.id }).del();
    if (deleted) {
      res.status(200).json({ message: "Product deleted successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
