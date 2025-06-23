import knex from "knex";
import knexConfig from "../knex/knexfile.js"; // ✅ add `.js` extension

const db = knex(knexConfig.development);

export default db;
