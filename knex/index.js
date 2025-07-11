import express from "express";
import knex from "./knex/knex.js";

const PORT = process.env.PORT || 3001;
const app = express();

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
