const knex = require("knex");
const knexConfig = require("../knex/knexfile");

const db = knex(knexConfig.development); // or .production/.test based on env
module.exports = db;
