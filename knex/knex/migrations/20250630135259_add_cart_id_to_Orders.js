/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table("Orders", (table) => {
    table
      .integer("cart_id")
      .unique()
      .unsigned()
      .references("id")
      .inTable("Cart")
      .onDelete("CASCADE");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table("Orders", (table) => {
    table.dropColumn("cart_id");
  });
}
