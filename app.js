const express = require("express");
const app = express();

app.use(express.json());

const productRoutes = require("./routes/Products");
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const orderItemRoutes = require("./routes/orderItems");
const reviewRoutes = require("./routes/reviews");
const cartRoutes = require("./routes/Cart");
const mailerRoutes = require("./routes/mailer");

app.use("/mailer", mailerRoutes);
app.use("/cart", cartRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/reviews", reviewRoutes);
app.use("/orderItems", orderItemRoutes);
app.use("/orders", orderRoutes);
app.use("/Products", productRoutes);
app.use("/api/auth", authRoutes);

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
