const express = require("express");
const router = express.Router();
const knex = require("../db/db");

router.post("/", async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const newReview = await knex("Review")
      .insert({ rating, comment })
      .returning("*");
    res.json(newReview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const reviews = await knex("Review").select("*");
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const review = await knex("Review").where({ id: req.params.id }).first();

    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const updated = await knex("Review")
      .where({ id: req.params.id })
      .update({ rating, comment, updated_at: knex.fn.now() })
      .returning("*");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await knex("Review").where({ id: req.params.id }).del();
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
