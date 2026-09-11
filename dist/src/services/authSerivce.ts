import bcrypt from "bcrypt";
import db from "../database/db";
import { logger } from "../utils/logger";
import { UserRow } from "../types/userTypes";
import {
  generateAccessToken,
  generateEmailVerificationToken,
} from "../helpers/jwtHelper";

import { getUserByEmail } from "../models/userModel";
import { lastLoggedIn } from "../models/authModels";
import { sendEmail } from "../utils/sendEmail";

export interface registerInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface loginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    emailVerified: boolean;
  };
  token: string;
}

const SALT_ROUNDS = 10;

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

// hashing password by using bcrypt
const hashpassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

// compare a password with a hash
const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// registering a new user
export const registerUser = async (
  userData: registerInput,
): Promise<AuthResponse> => {
  try {
    const { email, firstName, lastName, password } = userData;
    const normalizedEmail = normalizeEmail(email);
    const existingUser = await getUserByEmail(normalizedEmail);

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await hashpassword(password);

    // create a new user
    const [newUser] = (await db("user")
      .withSchema("Oauth")
      .insert({
        email: normalizeEmail(email),
        first_name: firstName,
        last_name: lastName,
        password_hash: hashedPassword,
        email_verified: false,
      })

      .returning([
        "id",
        "email",
        "first_name",
        "last_name",
        "email_verified",
      ])) as UserRow[];

    if (!newUser) {
      throw new Error("Failed to create user");
    }

    // generate a token
    const token = generateAccessToken({
      id: newUser.id,
      email: newUser.email,
    });

    // update last logged in time
    await lastLoggedIn(newUser.id);

    // send verification email asynchronously
    try {
      const verificationToken = generateEmailVerificationToken({
        userId: newUser.id,
        email: newUser.email,
        type: "email_verification",
      }); // Assuming the token is returned in the user object

      // Send verification email
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
      const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

      // const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
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
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        emailVerified: newUser.email_verified,
      },
      token,
    };
  } catch (error) {
    logger.error(
      "Error registering user:",
      error instanceof Error ? error.stack : error,
    );
    if (error instanceof Error) throw error;
    throw new Error(String(error));
  }
};

// login
export const loginUser = async (
  loginData: loginInput,
): Promise<AuthResponse> => {
  try {
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
    await lastLoggedIn(user.id);

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
  } catch (error) {
    logger.error(
      "Error logging in user:",
      error instanceof Error ? error.stack : error,
    );
    if (error instanceof Error) throw error;
    throw new Error(String(error));
  }
};
