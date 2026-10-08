import { Request, Response } from "express";
import { z } from "zod";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/responseHandler";
import { registerUser, loginUser } from "../services/authSerivce";

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

    const result = await registerUser(validationResult.data);

    return sendSuccessResponse(
      res,
      result,
      "User registered successfully",
      201,
    );
  } catch (error) {
    return sendErrorResponse(
      res,
      "Error registering user",
      error instanceof Error ? error.message : "Internal server error",
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

    const result = await loginUser(validateResult.data);

    return sendSuccessResponse(res, result, "User logged in successfully", 200);
  } catch (error) {
    return sendErrorResponse(
      res,
      "Error logging in user",
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
};

// validate schemas
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
