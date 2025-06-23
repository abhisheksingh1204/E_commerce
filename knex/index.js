import express from "express";
import knex from "./knex/knex.js"; // ✅ add `.js` extension if it's a local file

const PORT = process.env.PORT || 3001;
const app = express();

// app.get("/tasks", (req, res) => {});

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
