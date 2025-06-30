/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.table("Review", function (table) {
    table
      .integer("ProductId")
      .unsigned()
      .references("id")
      .inTable("Products")
      .onDelete("CASCADE");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.table("Review", function (table) {
    table.dropColumn("ProductId");
  });
}
