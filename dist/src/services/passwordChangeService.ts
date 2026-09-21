import { AppError, ErrorCode } from "../utils/dbErrorHandler";
import { getUserByEmail, getUserById } from "../models/userModel";
import { logger } from "../utils/logger";
import { sendEmail } from "../utils/sendEmail";
import {
  generatePasswordResetToken,
  verifyPasswordResetToken,
} from "../helpers/jwtHelper";
import { PasswordResetTokenPayload } from "../helpers/jwtHelper";
import db from "../database/db";
import { hashpassword } from "./authSerivce";

export interface PasswordResetData {
  token: string;
  newPassword: string;
}

export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    const user = await getUserByEmail(email);

    if (!user) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, "User not found", 404);
    }

    const token = generatePasswordResetToken({
      userId: user.id,
      email: user.email,
      type: "password-reset",
    });

    // create a reset-password Link
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password.</p>
      <p>The link is valid for an hour.</p>
      <p>If you did not request this, please ignore this email.</p>`,
      message: `You requested a password reset. Use the following link to reset your password: ${resetLink}`,
    });

    logger.info("Password reset email sent successfully!");
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    } else {
      logger.error(
        "An unexpected error occurred while handling password reset.",
      );
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        "Internal Server Error",
        500,
      );
    }
  }
};

export const resetPassword = async (
  passwordResetData: PasswordResetData,
): Promise<void> => {
  try {
    const { token, newPassword } = passwordResetData;

    // verify the token and reset the password
    let decodedToken: PasswordResetTokenPayload;

    try {
      decodedToken = verifyPasswordResetToken(token);
    } catch (error) {
      throw new AppError(
        ErrorCode.INVALID_TOKEN,
        "Invalid or expired token!",
        400,
      );
    }

    const { userId, email } = decodedToken;

    const user = await getUserById(userId);

    if (!user) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, "User not found", 404);
    }

    // verify email for security purposes
    if (user.email !== email) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, "Email mismatch", 400);
    }

    // Hash new password
    const hashedPassword = await hashpassword(newPassword);

    // update the user's password in the database
    await db("user").withSchema("Oauth").where({ id: userId }).update({
      password_hash: hashedPassword,
      updated_on: db.fn.now(),
    });

    await sendEmail({
      email: user.email,
      subject: "Password Reset Successful",
      html: `<p>Your password has been successfully reset.</p>
      <p>If you did not request this, please contact support immediately.</p>`,
      message: `Your password has been successfully reset. If you did not request this, please contact support immediately.`,
    });

    logger.info("Password reset email sent successfully!");
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    } else {
      logger.error(
        "An unexpected error occurred while resetting the password.",
      );
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        "Internal Server Error",
        500,
      );
    }
  }
};
