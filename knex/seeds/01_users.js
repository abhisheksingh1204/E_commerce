/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  
  await knex("users").del();
  await knex("users").insert([
    { id: 1, name: "xyz", email: "xysz@qwert.com", password: "pass123" },
    { id: 2, name: "xyzab", email: "abcd@qwert.com", password: "pass1234" },
    { id: 3, name: "xyzabcd", email: "mnop@qwert.com", password: "pass12345" },
    { id: 4, name: "uvwabcd", email: "mnp@qwert.com", password: "case12345" },
  ]);
};
