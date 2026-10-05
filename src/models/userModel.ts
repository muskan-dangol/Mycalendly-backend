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

export const updateUserLastLoggedInTime = async (
  userId: string,
): Promise<void> => {
  try {
    await db("user")
      .withSchema("Oauth")
      .where({ id: userId })
      .update({ last_logged_in: db.fn.now() });
  } catch (error) {
    console.error("Error updating last logged in time:", error);
  }
};

export const updateUserInfo = async (
  id: string,
  updates: Partial<{
    email: string;
    firstName: string;
    lastName: string;
    hashedPassword: string;
    emailVerified: boolean;
  }>,
): Promise<User | null> => {
  const updateData: Partial<{
    email: string;
    first_name: string;
    last_name: string;
    password_hash: string;
    email_verified: boolean;
  }> = {};

  if (!updates || Object.keys(updates).length === 0) {
    return (await db("user")
      .withSchema("Oauth")
      .where({ id })
      .first()) as User | null;
  }

  if (updates.email) updateData.email = normalizeEmail(updates.email);
  if (updates.firstName) updateData.first_name = updates.firstName;
  if (updates.lastName) updateData.last_name = updates.lastName;
  if (updates.hashedPassword) updateData.password_hash = updates.hashedPassword;
  if (updates.emailVerified) updateData.email_verified = updates.emailVerified;

  return (await db("user")
    .withSchema("Oauth")
    .where({ id })
    .update({ ...updateData, updated_on: new Date() })
    .returning([
      "id",
      "email",
      "first_name",
      "last_name",
      "email_verified",
    ])) as User | null;
};
