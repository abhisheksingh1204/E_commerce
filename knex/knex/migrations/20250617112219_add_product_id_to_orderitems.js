/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("OrderItems", function (table) {
    table
      .integer("product_id")
      .unsigned()
      .references("id")
      .inTable("Products")
      .onDelete("CASCADE"); // optional, deletes order item if product is deleted
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("OrderItems", function (table) {
    table.dropColumn("product_id");
  });
};
