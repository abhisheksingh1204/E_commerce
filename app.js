const express = require("express");
const app = express();

app.use(express.json());

const productRoutes = require("./routes/Products");
const authRoutes = require("./routes/auth");

app.use("/products", productRoutes);
app.use("/api/auth", authRoutes);

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
