import { logger } from "../utils/logger";
import { generateAccessToken } from "../helpers/jwtHelper";
import { hashpassword, comparePassword } from "../helpers/passwordHelper";
import type {
  registerInput,
  loginInput,
  AuthResponse,
} from "../types/userTypes";
import { createNewUser, getUserByEmail } from "../models/userModel";
import { updateUserLastLoggedInTime } from "../models/authModels";


// registering a new user
export const registerUser = async (
  userData: registerInput,
): Promise<AuthResponse> => {
  const { email, firstName, lastName, password } = userData;

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await hashpassword(password);

  // create a new user
  const [newUser] = await createNewUser(
    email,
    firstName,
    lastName,
    hashedPassword,
  );

  if (!newUser) {
    throw new Error("Failed to create user");
  }

  // generate a token
  const token = generateAccessToken({
    id: newUser.id,
    email: newUser.email,
  });

  // update last logged in time
  await updateUserLastLoggedInTime(newUser.id);

  logger.info(`User registered successfully: ${newUser.email}`);

  return {
    token,
  };
};

// login
export const loginUser = async (
  loginData: loginInput,
): Promise<AuthResponse> => {
  const { email, password } = loginData;

  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);

  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  const token = generateAccessToken({
    id: user.id,
    email: user.email,
  });

  await updateUserLastLoggedInTime(user.id);

  logger.info(`User logged in successfully: ${user.email}`);

  return {
    token,
  };
};
