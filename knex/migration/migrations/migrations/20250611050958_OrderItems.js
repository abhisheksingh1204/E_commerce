/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("OrderItems", function (table) {
    table.increments();
    table.integer("user_id").notNullable();
    table.integer("order_id").notNullable();

    table.decimal("unique_price").notNullable();
    table.integer("quantity").notNullable();

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.specificType(
      "Total_amount",
      "decimal GENERATED ALWAYS AS (quantity * unique_price) STORED"
    );

    table.primary(["user_id", "order_id"]);

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table
      .foreign("order_id")
      .references("id")
      .inTable("Orders")
      .onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("OrderItems");
};
