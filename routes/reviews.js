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
 *               - user_id
 *             properties:
 *               rating:
 *                 type: integer
 *                 description: Rating given by the user (1-5)
 *               comment:
 *                 type: string
 *                 description: Review comment
 *               ProductId:
 *                 type: integer
 *                 description: ID of the product being reviewed
 *               user_id:
 *                 type: integer
 *                 description: ID of the user submitting the review
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
 *                 ProductId:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 created_at:
 *                   type: string
 *                   format: date-time
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
router.post("/", upload.none(), async (req, res) => {
  try {
    const { rating, comment, ProductId, user_id } = req.body;

    const [newReview] = await knex("Review")
      .insert({
        rating: Number(rating),
        comment,
        ProductId: Number(ProductId),
        user_id: Number(user_id),
      })
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
 *                   user_id:
 *                     type: integer
 *       500:
 *         description: Server error
 */
router.get("/:ProductId", async (req, res) => {
  try {
    const { ProductId } = req.params;

    const items = await knex("Review")
      .join("Products", "Review.ProductId", "Products.id")
      .join("users", "Review.user_id", "users.id")
      .select(
        "Review.id",
        "Review.ProductId",
        "Review.rating",
        "Review.comment",
        "Products.name as product_name",
        "users.id as user_id",
        "users.name as user_name"
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
 *               - user_id
 *             properties:
 *               rating:
 *                 type: integer
 *                 description: Updated rating (1-5)
 *               comment:
 *                 type: string
 *                 description: Updated comment
 *               ProductId:
 *                 type: integer
 *                 description: ID of the product being reviewed
 *               user_id:
 *                 type: integer
 *                 description: ID of the user updating the review
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
 *                 user_id:
 *                   type: integer
 *                 updated_at:
 *                   type: string
 *                   format: date-time
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

router.put("/:id", upload.none(), async (req, res) => {
  try {
    const { rating, comment, ProductId, user_id } = req.body;

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
 *       200:
 *         description: Review deleted successfully
 *       404:
 *         description: Review not found
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
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await knex("Review").where({ id: req.params.id }).del();

    if (deleted === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
