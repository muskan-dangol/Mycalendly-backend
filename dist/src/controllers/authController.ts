import { Request, Response } from "express";
import { z } from "zod";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/responseHandler";
import { logger } from "../utils/logger";
import { registerUser, loginUser } from "../services/authSerivce";

// validation schemas
const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const register = async (req: Request, res: Response) => {
  try {
    // validate req body
    const validationResult = registerSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return sendErrorResponse(res, errors, "Validation failed", 400);
    }
    const { firstName, lastName, email, password } = validationResult.data;

    const result = await registerUser({ firstName, lastName, email, password });

    return sendSuccessResponse(
      res,
      result,
      "User registered successfully",
      201,
    );
  } catch (error) {
    logger.error("Error registering user:", error);
    return sendErrorResponse(
      res,
      "Error registering user",
      "Internal server error",
      500,
    );
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // validate req body
    const validateResult = loginSchema.safeParse(req.body);

    if (!validateResult.success) {
      const errors = validateResult.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return sendErrorResponse(res, errors, "Validation failed", 400);
    }

    const { email, password } = validateResult.data;
    const result = await loginUser({ email, password });

    return sendSuccessResponse(res, result, "User logged in successfully", 200);
  } catch (error) {
    logger.error("Error logging in user:", error);
    if (error instanceof Error) {
      if (error.message === "Invalid password") {
        return sendErrorResponse(
          res,
          "Authentication failed",
          "Invalid password",

          401,
        );
      }

      if (error.message === "User not found") {
        return sendErrorResponse(
          res,
          "Authentication failed",
          "User not found",
          404,
        );
      }
    }

    return sendErrorResponse(
      res,
      "Error logging in user",
      "Internal server error",
      500,
    );
  }
};
