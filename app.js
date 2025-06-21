const express = require("express");
const app = express();

app.use(express.json());

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerConfig");

const productRoutes = require("./routes/Products");
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const reviewRoutes = require("./routes/reviews");
const cartRoutes = require("./routes/Cart");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/cart", cartRoutes);
app.use("/reviews", reviewRoutes);
app.use("/orders", orderRoutes);
app.use("/Products", productRoutes);
app.use("/api/auth", authRoutes);

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
