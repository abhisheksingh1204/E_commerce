const express = require("express");
const PORT = process.env.PORT || 3000;
const knex = require("./knex/knex.js");
const app = express();

app.get("/tasks", (req, res) => {
  // use the knex variable above to create dynamic queries
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
