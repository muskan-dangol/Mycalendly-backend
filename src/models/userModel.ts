import db from "../database/db";
import { UserRow as User } from "../types/userTypes";
import { normalizeEmail } from "../helpers/emailHelper";

export const getUserByEmail = async (
  email: string,
): Promise<User | undefined> => {
  const normalizedEmail = normalizeEmail(email);

  return (await db("user")
    .withSchema("Oauth")
    .whereRaw("LOWER(email) = ?", [normalizedEmail])
    .first()) as User | undefined;
};

export const getUserById = async (id: string): Promise<User | null> => {
  return (await db("user")
    .withSchema("Oauth")
    .where({ id })
    .first()) as User | null;
};

// create and return a new user
export const createNewUser = async (
  email: string,
  firstName: string,
  lastName: string,
  hashedPassword: string,
): Promise<User[]> => {
  return (await db("user")
    .withSchema("Oauth")
    .insert({
      email: normalizeEmail(email),
      first_name: firstName,
      last_name: lastName,
      password_hash: hashedPassword,
    })
    .returning([
      "id",
      "email",
      "first_name",
      "last_name",
      "email_verified",
    ])) as User[];
};
