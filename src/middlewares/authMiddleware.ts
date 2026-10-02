import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import jwt from "jsonwebtoken";
import { CustomRequest } from "../types";

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const getRequestLogContext = (req: Request): Record<string, string> => ({
  method: req.method,
  path: req.originalUrl || req.path || "unknown path",
  ip: req.ip || req.socket?.remoteAddress || "unknown",
});

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }
  if (!token) {
    next();
    logger.warn(
      `Token missing in request:access token is required`,
      getRequestLogContext(req),
    );
    return res.status(401).json({ message: "Token missing" });
  }
  if (!JWT_SECRET_KEY) {
    return res.status(500).json({ message: "JWT secret key not configured" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY) as unknown;
    if (!decoded || typeof decoded === "string") {
      logger.warn("JWT authentication rejected: decoded token invalid", {
        ...getRequestLogContext(req),
      });
      return res.status(401).json({ message: "Invalid token" });
    }

    (req as CustomRequest).user = decoded as jwt.JwtPayload & {
      id: string;
      email: string;
    };
    next();
  } catch (err) {
    logger.warn("JWT authentication rejected: invalid or expired token", {
      ...getRequestLogContext(req),
      errorName: err instanceof Error ? err.name : "UnknownError",
      errorMessage: err instanceof Error ? err.message : "Unknown error",
    });
    return res.status(401).json({ message: "Invalid token" });
  }
};
