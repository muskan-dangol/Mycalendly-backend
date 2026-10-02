import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// hashing password by using bcrypt
export const hashpassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

// compare a password with a hash
export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
