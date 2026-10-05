import { Response } from "express";
import { z } from "zod";
import {
  requestExistingUserEmailVerification,
  verifyEmail,
} from "../services/emailVerificationService";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../utils/responseHandler";
import { CustomRequest } from "../types";

export const verifiedEmail = async (req: CustomRequest, res: Response) => {
  try {
    // validate query parameters
    const parseResult = emailVerificationSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errors = parseResult.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return sendErrorResponse(res, "Validation failed", errors, 400);
    }

    await verifyEmail(parseResult.data);

    sendSuccessResponse(res, null, "Email verified successfully", 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendErrorResponse(
        res,
        error.message,
        "Email verification failed",
        400,
      );
    }
  }
};

export const emailVerificationRequest = async (
  req: CustomRequest,
  res: Response,
) => {
  try {
    const parseResult = emailVerificationRequestSchema.safeParse({
      userId: req.user?.id,
    });

    if (!parseResult.success) {
      const errors = parseResult.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return sendErrorResponse(res, "Validation failed", errors, 400);
    }

    await requestExistingUserEmailVerification(parseResult.data);

    sendSuccessResponse(
      res,
      null,
      "Email verification request sent successfully",
      200,
    );
  } catch (error) {
    if (error instanceof Error) {
      return sendErrorResponse(
        res,
        error.message,
        "Email verification request failed",
        400,
      );
    }
  }
};

const emailVerificationSchema = z.object({
  token: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "Token is required" : "Not a string",
    })
    .min(1, "Token is required"),
});

const emailVerificationRequestSchema = z.object({
  userId: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "User ID is required" : "Not a string",
    })
    .min(1, "User ID is required"),
});
