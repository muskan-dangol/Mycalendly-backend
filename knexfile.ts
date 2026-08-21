import type { Knex } from "knex";
import path from "path";
import { db_host, db_port, db_user, db_password, db_name } from "./config";
import {
  db_host_test,
  db_port_test,
  db_user_test,
  db_password_test,
  db_name_test,
} from "./config";

const migrationsDir = path.resolve(
  process.cwd(),
  "dist",
  "src",
  "database",
  "migrations",
);

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "postgresql",
    connection: {
      host: db_host,
      port: db_port,
      user: db_user,
      password: db_password,
      database: db_name,
    },
    pool: {
      min: 0,
      max: 7,
      idleTimeoutMillis: 10000,
    },
    migrations: {
      tableName: "knexMigrations",
      directory: migrationsDir,
    },
    seeds: {
      directory: path.resolve(process.cwd(), "src", "database", "seeds"),
    },
  },
  test: {
    client: "postgresql",
    connection: {
      host: db_host_test,
      port: db_port_test,
      user: db_user_test,
      password: db_password_test,
      database: db_name_test,
      ssl:
        process.env.DB_SSL_TEST === "true"
          ? { rejectUnauthorized: false }
          : false,
    },
    pool: {
      min: 2,
      max: 20,
    },
    migrations: {
      tableName: "knexMigrations",
      directory: migrationsDir,
    },
    seeds: {
      directory: path.resolve(process.cwd(), "src", "database", "seeds"),
    },
  },
};

export default config;
