import express from "express";
const router = express.Router();
import knex from "../db/db.js";
import multer from "multer";
const upload = multer();

/**
 * @openapi
 * /reviews:
 *   post:
 *     summary: Add a new review
 *     tags:
 *       - Reviews
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *               - ProductId
 *             properties:
 *               rating:
 *                 type: integer
 *                 description: Rating given by the user (1-5)
 *               comment:
 *                 type: string
 *                 description: Review comment
 *               ProductId:
 *                 type: integer
 *                 description: Id of product you want to write review of
 *     responses:
 *       200:
 *         description: Review added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 rating:
 *                   type: integer
 *                 comment:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 */
router.post("/", upload.none(), async (req, res) => {
  try {
    const { rating, comment, ProductId } = req.body;
    const newReview = await knex("Review")
      .insert({ rating, comment, ProductId })
      .returning("*");
    res.json(newReview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /reviews/{ProductId}:
 *   get:
 *     summary: Get reviews for a specific product
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: ProductId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to fetch reviews for
 *     responses:
 *       200:
 *         description: List of reviews for the given product
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   ProductId:
 *                     type: integer
 *                   rating:
 *                     type: integer
 *                   comment:
 *                     type: string
 *       500:
 *         description: Server error
 */
router.get("/:ProductId", async (req, res) => {
  try {
    const { ProductId } = req.params;

    const items = await knex("Review")
      .join("Products", "Review.ProductId", "Products.id")
      .select(
        "Review.id",
        "Review.ProductId",
        "Review.rating",
        "Review.comment",
        "Products.name"
      )
      .where("Review.ProductId", ProductId);

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// /**
//  * @openapi
//  * /reviews:
//  *   get:
//  *     summary: Get all reviews
//  *     tags:
//  *       - Reviews
//  *     responses:
//  *       200:
//  *         description: List of all reviews
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 type: object
//  *                 properties:
//  *                   id:
//  *                     type: integer
//  *                   rating:
//  *                     type: integer
//  *                     description: Rating given (1-5)
//  *                   comment:
//  *                     type: string
//  *                   created_at:
//  *                     type: string
//  *                     format: date-time
//  *       500:
//  *         description: Server error
//  */
// router.get("/:id", async (req, res) => {
//   try {
//     const review = await knex("Review").where({ id: req.params.id }).first();

//     if (!review) return res.status(404).json({ error: "Review not found" });
//     res.json(review);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

/**
 * @openapi
 * /reviews/{id}:
 *   put:
 *     summary: Update a review by ID
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the review to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *               - ProductId
 *             properties:
 *               rating:
 *                 type: integer
 *                 description: Updated rating (1-5)
 *               comment:
 *                 type: string
 *                 description: Updated comment
 *               ProductId:
 *                 type: integer
 *                 description: Id of product you adding reviw of
 *     responses:
 *       200:
 *         description: Review updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 rating:
 *                   type: integer
 *                 comment:
 *                   type: string
 *                 ProductId:
 *                   type: integer
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 */
router.put("/:id", upload.none(), async (req, res) => {
  try {
    const { rating, comment, ProductId } = req.body;

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
 * @openapi
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review by ID
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the review to delete
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Review deleted successfully (No Content)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Review not found
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

export default router;
