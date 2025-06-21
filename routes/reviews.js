const express = require("express");
const router = express.Router();
const knex = require("../db/db");

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Add a new review
 *     responses:
 *       200:
 *         description: Review added successfully
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Get all reviews
 *     responses:
 *       200:
 *         description: List of all reviews
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
  try {
    const reviews = await knex("Review").select("*");
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: Get a single review by ID
 *     responses:
 *       200:
 *         description: Review found
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const review = await knex("Review").where({ id: req.params.id }).first();

    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Update a review by ID
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review by ID
 *     responses:
 *       204:
 *         description: Review deleted
 *       500:
 *         description: Server error
 */
router.delete("/:id", async (req, res) => {
  try {
    await knex("Review").where({ id: req.params.id }).del();
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
