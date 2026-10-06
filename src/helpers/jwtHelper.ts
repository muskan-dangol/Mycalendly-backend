import jwt from "jsonwebtoken";

export const generateAccessToken = (payload: tokenPayload): string => {
  const secret = process.env.JWT_SECRET_KEY;
  const expiresIn: string = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || "30d";

  if (!secret) {
    throw new Error("JWT secret key is not defined");
  }

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const generateEmailVerificationToken = (
  payload: EmailVerificationTokenPayload,
): string => {
  const secret = process.env.JWT_SECRET_KEY;
  const expiresIn: string = "1h";

  if (!secret) {
    throw new Error("JWT secret key is not defined");
  }

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const verifyToken = (token: string): tokenPayload => {
  const secret = process.env.JWT_SECRET_KEY;

  if (!secret) {
    throw new Error("JWT secret key is not defined");
  }
  return jwt.verify(token, secret) as tokenPayload;
};

export const verifyEmailToken = (
  token: string,
): EmailVerificationTokenPayload => {
  const secret = process.env.JWT_SECRET_KEY;

  if (!secret) {
    throw new Error("JWT secret key is not defined");
  }

  return jwt.verify(token, secret) as EmailVerificationTokenPayload;
};

/**
 * Generate password reset token
 */
export const generatePasswordResetToken = (
  payload: PasswordResetTokenPayload,
): string => {
  const secret = process.env.JWT_SECRET_KEY;
  const expiresIn = "24h";

  if (!secret) {
    throw new Error("JWT_SECRET_KEY is not defined");
  }

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

/**
 * Verify password reset token
 */
export const verifyPasswordResetToken = (
  token: string,
): PasswordResetTokenPayload => {
  const secret = process.env.JWT_SECRET_KEY;

  if (!secret) {
    throw new Error("JWT_SECRET_KEY is not defined");
  }

  const decoded = jwt.verify(token, secret) as PasswordResetTokenPayload;

  if (decoded.type !== "password-reset") {
    throw new Error("Invalid token type");
  }

  return decoded;
};

export interface tokenPayload {
  id: string;
  email: string;
}

export interface EmailVerificationTokenPayload {
  userId: string;
  email: string;
  type: "email_verification";
}

export interface PasswordResetTokenPayload {
  userId: string;
  email: string;
  type: "password-reset";
}
