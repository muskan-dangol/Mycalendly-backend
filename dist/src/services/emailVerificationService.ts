import {
  generateEmailVerificationToken,
  verifyEmailToken,
} from "../helpers/jwtHelper";
import { AppError, ErrorCode } from "../utils/dbErrorHandler";
import { getUserById } from "../models/userModel";
import db from "../database/db";
import { logger } from "../utils/logger";
import { sendEmail } from "../utils/sendEmail";

export interface EmailVerificationData {
  token: string;
}

export interface EmailVerificationRequestData {
  userId: string;
}

export const verifyEmail = async (data: EmailVerificationData) => {
  try {
    const { token } = data;

    let decodedToken;

    try {
      decodedToken = verifyEmailToken(token);
    } catch (error) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        "Invalid or expired verification token",
        400,
      );
    }

    if (decodedToken.type !== "email_verification") {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        "Invalid verification token type",
        400,
      );
    } else {
      const { userId, email } = decodedToken;

      const user = await getUserById(userId);

      if (!user) {
        throw new AppError(ErrorCode.USER_NOT_FOUND, "User not found", 404);
      }

      if (user.email !== email) {
        throw new AppError(
          ErrorCode.VALIDATION_ERROR,
          "Email does not match",
          400,
        );
      }

      await db("user").withSchema("Oauth").where({ id: userId }).update({
        email_verified: true,
        updated_on: db.fn.now(),
      });

      const message = `<p>Your email has been successfully verified.</p>
      <p>Follow that link to continue using our services: <a href="http://localhost:3001/login">http://localhost:3001/login</a></p>`;

      await sendEmail({
        email: email,
        subject: "Email Verified Successfully - MyCalendy",
        html: message,
        message,
      });

      logger.info(`Email verified successfully for user ${userId}`);
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    } else {
      logger.error(`Internal server error: ${error}`);
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        "Internal server error",
        500,
      );
    }
  }
};

export const requestExistingUserEmailVerification = async (
  data: EmailVerificationRequestData,
) => {
  try {
    const { userId } = data;

    const user = await getUserById(userId);
    if (!user) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, "User not found", 404);
    }

    //  Check if email is already verified
    if (user.email_verified) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        "Email is already verified",
        400,
      );
    }

    // Generate a new email verification token
    const token = generateEmailVerificationToken({
      userId: user.id,
      email: user.email,
      type: "email_verification",
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
    const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

    const message = `<p>You are getting this email because you tried to register with this email address at mycalendy.</p>
          <p>Please verify your email by clicking the following link: <a href="${verificationLink}">${verificationLink}</a></p>
          <p>If you did not request this, please ignore this email.</p>`;

    await sendEmail({
      email: user.email,
      subject: "Email Verification",
      html: message,
      message,
    });

    logger.info(
      `Email verification requested for user ${userId}. Verification link: ${verificationLink}`,
    );

    return { message: "Verification email sent", verificationLink };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    } else {
      logger.error(`Internal server error: ${error}`);
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        "Internal server error",
        500,
      );
    }
  }
};
