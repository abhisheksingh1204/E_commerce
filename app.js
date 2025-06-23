import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swaggerConfig.js"; // ✅ add `.js`

import productRoutes from "./routes/Products.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";
import reviewRoutes from "./routes/reviews.js";
import cartRoutes from "./routes/Cart.js";

const app = express();
app.use(express.json());

// Swagger docs route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/cart", cartRoutes);
app.use("/reviews", reviewRoutes);
app.use("/orders", orderRoutes);
app.use("/Products", productRoutes);
app.use("/api/auth", authRoutes);

// Server listener
app.listen(3001, () => {
  console.log("Server running on port 3001");
});
