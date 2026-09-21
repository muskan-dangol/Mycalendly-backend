import { Request, Response } from "express";
import { z } from "zod";
import {
  requestPasswordReset,
  resetPassword,
} from "../services/passwordChangeService";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/responseHandler";

const passwordChangeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const passwordResetSchema = z
  .object({
    token: z
      .string({
        error: (issue) =>
          issue.input === undefined ? "Token is required" : "Not a string",
      })
      .min(1, "Token is required"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters long"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const passwordResetRequestController = async (
  req: Request,
  res: Response,
) => {
  try {
    const validationResult = passwordChangeSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error;
      const errorMessages =
        errors.issues.map((issue) => issue.message).join(", ") ||
        "Validation failed";

      return sendErrorResponse(res, errorMessages, "Validation failed", 400);
    }

    const { email } = validationResult.data;

    await requestPasswordReset(email);

    return sendSuccessResponse(
      res,
      null,
      "Password reset email sent successfully!",
      200,
    );
  } catch (error) {
    return sendErrorResponse(
      res,
      "An error occurred while resetting the password.",
      "Internal server error",
      500,
    );
  }
};

export const passwordResetController = async (req: Request, res: Response) => {
  try {
    const validationResult = passwordResetSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error;
      const errorMessages =
        errors.issues.map((issue) => issue.message).join(", ") ||
        "Validation failed";

      return sendErrorResponse(res, errorMessages, "Validation failed", 400);
    }

    const { token, newPassword } = validationResult.data;

    await resetPassword({ token, newPassword });

    return sendSuccessResponse(
      res,
      null,
      "Password reset successfully. Please log in with your new password.",
      200,
    );
  } catch (error) {
    return sendErrorResponse(
      res,
      "An error occurred while changing the password.",
      "Internal server error",
      500,
    );
  }
};
