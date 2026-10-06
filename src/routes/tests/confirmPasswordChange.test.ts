import request from "supertest";
import express from "express";
import { beforeEach, describe, it, expect, jest } from "@jest/globals";

import { confirmPasswordReset } from "../../services/confirmPasswordChangeService";
import router from "../index";

jest.mock("../../services/confirmPasswordChangeService", () => ({
  confirmPasswordReset: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use("/api", router);

// Tests for the password reset functionality
describe("Password reset confirm", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should reset the password successfully", async () => {
    const response = await request(app)
      .post("/api/password-reset/confirm")
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
      .post("/api/password-reset/confirm")
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
    (confirmPasswordReset as jest.Mock<typeof confirmPasswordReset>).mockRejectedValue(
      new Error("Invalid token"),
    );
    const response = await request(app)
      .post("/api/password-reset/confirm")
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
    (confirmPasswordReset as jest.Mock<typeof confirmPasswordReset>).mockImplementation(
      () => {
        throw new Error("Internal server error");
      },
    );

    const response = await request(app)
      .post("/api/password-reset/confirm")
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
