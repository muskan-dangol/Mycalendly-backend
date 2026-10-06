import { AppError, ErrorCode } from "../utils/dbErrorHandler";
import { getUserById } from "../models/userModel";
import { logger } from "../utils/logger";
import { sendEmail } from "../utils/sendEmail";
import { verifyPasswordResetToken } from "../helpers/jwtHelper";
import { PasswordResetTokenPayload } from "../helpers/jwtHelper";
import { hashpassword } from "../helpers/passwordHelper";
import { updateUserInfo } from "../models/userModel";

export const confirmPasswordReset = async (
  passwordResetData: PasswordResetData,
): Promise<void> => {
  const { token, newPassword } = passwordResetData;

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
  await updateUserInfo(userId, {
    hashedPassword: hashedPassword,
  });

  await sendEmail({
    email: user.email,
    subject: "Password Reset Successful",
    html: `<p>Your password has been successfully reset.</p>
      <p>If you did not request this, please contact support immediately.</p>`,
    message: `Your password has been successfully reset. If you did not request this, please contact support immediately.`,
  });

  logger.info("Password reset successfully!");
};

interface PasswordResetData {
  token: string;
  newPassword: string;
}
