/**
 * @type {import('knex').Knex.Config}
 */
const config = {
  development: {
    client: "pg",
    connection: {
      host: "127.0.0.1",
      database: "ecommerce",
      user: "postgres",
      password: "abhishek",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: "./knex/migrations",
      tableName: "knex_migrations",
    },
  },
};

export default config;
