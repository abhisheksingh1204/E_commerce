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
 * /products:
 *   post:
 *     summary: Add a new product (without image upload)
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock_quantity
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the product
 *               price:
 *                 type: number
 *                 description: Price of the product
 *               stock_quantity:
 *                 type: integer
 *                 description: Quantity available in stock
 *               image_url:
 *                 type: string
 *                 description: Optional image URL or file name
 *     responses:
 *       200:
 *         description: Product added
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
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search term for product name (case-insensitive)
 *     responses:
 *       200:
 *         description: List of products
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
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock_quantity
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
 *                 updated_at:
 *                   type: string
 *                   format: date-time
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

export default router;
