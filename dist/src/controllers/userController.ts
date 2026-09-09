import { Request, Response } from "express";
import { z } from "zod";
import {
  requestExistingUserEmailVerification,
  verifyEmail,
} from "../services/emailVerificationService";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../utils/responseHandler";
import { logger } from "../utils/logger";
import { CustomRequest } from "../types";

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

export const verifiedEmail = async (
  req: CustomRequest,
  res: Response,
): Promise<Response> => {
  try {
    // validate query parameters
    const parseResult = emailVerificationSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errors = parseResult.error;
      const errorMessages =
        errors.issues.map((issue) => issue.message).join(", ") ||
        "Validation failed";
      return res.status(400).json({
        success: false,
        message: errorMessages,
      });
    }

    const { token } = parseResult.data;

    await verifyEmail({ token });

    return sendSuccessResponse(res, null, "Email verified successfully", 200);
  } catch (error) {
    if (error instanceof Error) {
      return sendErrorResponse(
        res,
        error.message,
        "Email verification failed",
        400,
      );
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const emailVerificationRequest = async (
  req: CustomRequest,
  res: Response,
): Promise<Response> => {
  try {
    const parseResult = emailVerificationRequestSchema.safeParse(req.user?.id);

    if (!parseResult.success) {
      const errors = parseResult.error;
      const errorMessages =
        errors.issues.map((issue) => issue.message).join(", ") ||
        "Validation failed";
      return res.status(400).json({
        success: false,
        message: errorMessages,
      });
    }

    const { userId } = parseResult.data;

    await requestExistingUserEmailVerification({ userId });

    return sendSuccessResponse(
      res,
      null,
      "Email verification request sent successfully",
      200,
    );
  } catch (error) {
    logger.error("Error sending email verification request:", error);
    if (error instanceof Error) {
      return sendErrorResponse(
        res,
        error.message,
        "Email verification request failed",
        400,
      );
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
