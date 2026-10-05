import { logger } from "../utils/logger";
import {
  generateAccessToken,
  generateEmailVerificationToken,
} from "../helpers/jwtHelper";
import { hashpassword, comparePassword } from "../helpers/passwordHelper";
import type {
  registerInput,
  loginInput,
  AuthResponse,
} from "../types/userTypes";
import { createNewUser, getUserByEmail, updateUserLastLoggedInTime } from "../models/userModel";
import { sendEmail } from "../utils/sendEmail";

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

  // send verification email
  try {
    const verificationToken = generateEmailVerificationToken({
      userId: newUser.id,
      email: newUser.email,
      type: "email_verification",
    });

    // Send verification email
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
    const message = `<p>You are getting this email because you tried to register with this email address at mycalendy.</p>
      <p>Please verify your email by clicking the following link: <a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>If you did not request this, please ignore this email.</p>`;

    await sendEmail({
      email: newUser.email,
      subject: "Email Verification",
      html: message,
      message,
    });
  } catch (error) {
    logger.error(
      `Error sending verification email to ${newUser.email} for userId : ${newUser.id}`,
      error,
    );
  }
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
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      emailVerified: user.email_verified,
    },
    token,
  };
};
