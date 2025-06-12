const express = require("express");
const app = express();

app.use(express.json());

const productRoutes = require("./routes/Products");
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const orderItemRoutes = require("./routes/orderItems");
const reviewRoutes = require("./routes/reviews");

app.use("/uploads", express.static("uploads"));
app.use("/reviews", reviewRoutes);
app.use("/order-items", orderItemRoutes);
app.use("/orders", orderRoutes);
app.use("/products", productRoutes);
app.use("/api/auth", authRoutes);

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
