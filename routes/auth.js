import express from "express";
const router = express.Router();
import db from "../db/db.js";

import { register, login } from "../controllers/authController.js";

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or user already exists
 *       500:
 *         description: Server error
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     description: This api is used to login user
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post("/login", login);

/**
 * @swagger
 * /auth:
 *   get:
 *     summary: Get list of all users
 *     responses:
 *       200:
 *         description: List of users
 *       500:
 *         description: Failed to fetch users
 */
router.get("/", async (req, res) => {
  try {
    const users = await db("users").select("id", "name", "email");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;
