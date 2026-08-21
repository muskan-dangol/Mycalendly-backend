import db from "../database/db";
import { UserRow as User } from "../types/userTypes";

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const getUserByEmail = async (
  email: string,
): Promise<User | undefined> => {
  try {
    const normalizedEmail = normalizeEmail(email);

    return (await db("user")
      .withSchema("Oauth")
      .whereRaw("LOWER(email) = ?", [normalizedEmail])
      .first()) as User | undefined;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return undefined;
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const user = (await db("user")
      .withSchema("Oauth")
      .where({ id })
      .first()) as User;

    return user;
  } catch (error) {
    console.error("Error fetching user by id:", error);
    return null;
  }
};
