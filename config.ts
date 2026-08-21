import dotenv from "dotenv";

const nodeEnv = process.env.NODE_ENV || "development";
dotenv.config({ path: nodeEnv === "production" ? ".env" : ".env.development" });

export const port = Number(process.env.API_PORT);

export const db_host = String(process.env.DB_HOST);
export const db_port = Number(process.env.DB_PORT);
export const db_name = String(process.env.DB_NAME);
export const db_user = String(process.env.DB_USER);
export const db_password = String(process.env.DB_PASSWORD);

export const db_host_test = String(process.env.DB_HOST_TEST);
export const db_port_test = Number(process.env.DB_PORT_TEST);
export const db_name_test = String(process.env.DB_NAME_TEST);
export const db_user_test = String(process.env.DB_USER_TEST);
export const db_password_test = String(process.env.DB_PASSWORD_TEST);