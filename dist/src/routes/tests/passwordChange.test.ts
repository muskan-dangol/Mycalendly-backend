import request from "supertest";
import express from "express";
import { beforeEach, describe, it, expect, jest } from "@jest/globals";

import {
  resetPassword,
  requestPasswordReset,
} from "../../services/passwordChangeService";
import router from "../passwordResetRoutes";

jest.mock("../../services/passwordChangeService", () => ({
  resetPassword: jest.fn(),
  requestPasswordReset: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use("/api", router);

describe("Password Change Request", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should request a password reset successfully", async () => {
    (
      requestPasswordReset as jest.Mock<typeof requestPasswordReset>
    ).mockResolvedValue(undefined);

    const response = await request(app)
      .post("/api/reset-password/request")
      .send({
        email: "user@example.com",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Password reset email sent successfully!",
    );
  });

  it("should give error when requesting a password reset with invalid email", async () => {
    (
      requestPasswordReset as jest.Mock<typeof requestPasswordReset>
    ).mockRejectedValue(new Error("Invalid email"));

    const response = await request(app)
      .post("/api/reset-password/request")
      .send({
        email: "invalid-email",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Invalid email address");
  });

  it("should give internal server error when something goes wrong", async () => {
    (
      requestPasswordReset as jest.Mock<typeof requestPasswordReset>
    ).mockRejectedValue(new Error("Internal server error"));

    const response = await request(app)
      .post("/api/reset-password/request")
      .send({
        email: "user@example.com",
      });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Internal server error");
  });
});

// Tests for the password reset functionality
describe("Password Reset", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should reset the password successfully", async () => {
    const response = await request(app)
      .post("/api/reset-password/confirm")
      .send({
        token: "valid-token",
        newPassword: "newpassword",
        confirmPassword: "newpassword",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Password reset successfully. Please log in with your new password.",
    );
  });

  it("should give error when resetting the password with invalid data", async () => {
    const response = await request(app)
      .post("/api/reset-password/confirm")
      .send({
        token: "",
        newPassword: "short",
        confirmPassword: "mismatch",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe(
      "Token is required, Password must be at least 6 characters long, Passwords do not match",
    );
    expect(response.body.message).toBe("Validation failed");
  });

  it("should give error when token is missing", async () => {
    (resetPassword as jest.Mock<typeof resetPassword>).mockRejectedValue(
      new Error("Invalid token"),
    );
    const response = await request(app)
      .post("/api/reset-password/confirm")
      .send({
        token: "",
        newPassword: "newpassword",
        confirmPassword: "newpassword",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Token is required");
  });

  it("should give internal server error when something goes wrong", async () => {
    (resetPassword as jest.Mock).mockImplementation(() => {
      throw new Error("Internal server error");
    });

    const response = await request(app)
      .post("/api/reset-password/confirm")
      .send({
        token: "valid-token",
        newPassword: "newpassword",
        confirmPassword: "newpassword",
      });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Internal server error");
  });
});
