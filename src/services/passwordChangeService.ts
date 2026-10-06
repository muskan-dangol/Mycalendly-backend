import { AppError, ErrorCode } from "../utils/dbErrorHandler";
import { getUserByEmail } from "../models/userModel";
import { logger } from "../utils/logger";
import { sendEmail } from "../utils/sendEmail";
import { generatePasswordResetToken } from "../helpers/jwtHelper";

export const requestPasswordReset = async (email: string): Promise<void> => {
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
};
