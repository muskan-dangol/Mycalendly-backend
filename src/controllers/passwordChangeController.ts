import { Request, Response } from "express";
import { z } from "zod";
import { requestPasswordReset } from "../services/passwordChangeService";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/responseHandler";

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

const passwordChangeSchema = z.object({
  email: z.string().email("Invalid email address"),
});
