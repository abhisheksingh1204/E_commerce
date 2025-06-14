const express = require("express");
const router = express.Router();
const knex = require("../db/db");
const upload = require("../middleware/upload");

router.post("/image", upload.single("image"), async (req, res) => {
  const { name, price, stock_quantity } = req.body;
  const image_url = req.file ? req.file.filename : null;

  const [product] = await knex("products")
    .insert({ name, price, stock_quantity, image_url })
    .returning("*");

  res.json(product);
});

router.post("/", async (req, res) => {
  try {
    const { name, price, stock_quantity, image_url } = req.body;
    const newProduct = await knex("products")
      .insert({ name, price, stock_quantity, image_url })
      .returning("*");
    res.json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const search = req.query.search || "";
    const products = await knex("products").whereILike("name", `%${search}%`);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, price, stock_quantity, image_url } = req.body;
    const updated = await knex("products")
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

router.delete("/:id", async (req, res) => {
  try {
    await knex("products").where({ id: req.params.id }).del();
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
