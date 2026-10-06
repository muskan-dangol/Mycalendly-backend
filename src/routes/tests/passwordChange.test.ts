import request from "supertest";
import express from "express";
import { beforeEach, describe, it, expect, jest } from "@jest/globals";

jest.mock("../../services/passwordChangeService", () => ({
  requestPasswordReset: jest.fn(),
}));

import { requestPasswordReset } from "../../services/passwordChangeService";
import router from "../index";

const app = express();
app.use(express.json());
app.use("/api", router);

describe("Password reset request", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should request a password reset successfully", async () => {
    (
      requestPasswordReset as jest.Mock<typeof requestPasswordReset>
    ).mockResolvedValue(undefined);

    const response = await request(app)
      .post("/api/password-reset/request")
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
      .post("/api/password-reset/request")
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
      .post("/api/password-reset/request")
      .send({
        email: "user@example.com",
      });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Internal server error");
  });
});
