import { Response } from "express";
import { ApiResponse } from "../types";

export const sendSuccessResponse = <T>(
  res: Response,
  data: T,
  message: string = "Success",
  statusCode = 200,
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  } as ApiResponse<T>);
};

export const sendErrorResponse = (
  res: Response,
  error: string,
  message: string = "Error",
  statusCode = 400,
): Response => {
  const path =
    res.req?.method && res.req?.path
      ? `${res.req.method} ${res.req.path}`
      : "unknown path";
  const isClientError = statusCode >= 400 && statusCode < 500;
  const log = isClientError ? console.warn : console.error;
  const logOption = isClientError ? { skipNewRelic: true } : undefined;

  log(`API error at ${path} ${statusCode}: ${error}`, logOption);

  return res.status(statusCode).json({
    success: false,
    message,
    error,
  } as ApiResponse);
};
