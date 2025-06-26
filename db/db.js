import knex from "knex";
import knexConfig from "../knex/knexfile.js";

const db = knex(knexConfig.development);

export default db;
