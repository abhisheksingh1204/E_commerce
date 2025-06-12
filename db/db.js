const knex = require("knex");
const knexConfig = require("../knex/knexfile");

const db = knex(knexConfig.development);
module.exports = db;
