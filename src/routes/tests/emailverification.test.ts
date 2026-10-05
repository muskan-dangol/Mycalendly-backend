import request from "supertest";
import { beforeEach, describe, expect, jest, it } from "@jest/globals";
import express from "express";

import router from "../index";
import { verifyEmail } from "../../services/emailVerificationService";

jest.mock("../../services/emailVerificationService", () => ({
  verifyEmail: jest.fn(),
  requestExistingUserEmailVerification: jest.fn(),
}));

const app = express();
app.use(express.json());

app.use((req, _res, next) => {
  // @ts-ignore - test helper to mock authenticated user
  // controller expects `req.user.id` to be a string userId
  req.user = { id: "test-user-id" } as any;
  next();
});
app.use("/api", router);

describe("Email Verification API", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("Email Verification", () => {
    it("POST /user/verify-email - success", async () => {
      (verifyEmail as jest.Mock<typeof verifyEmail>).mockResolvedValue(
        undefined,
      );

      const response = await request(app)
        .post("/api/user/verify-email")
        .send({ token: "test-token" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty(
        "message",
        "Email verified successfully",
      );
    });

    it("POST /user/verify-email - failure", async () => {
      (verifyEmail as jest.Mock<typeof verifyEmail>).mockRejectedValue(
        new Error("Invalid token"),
      );

      const response = await request(app)
        .post("/api/user/verify-email")
        .send({ token: "invalid-token" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty(
        "message",
        "Email verification failed",
      );
    });

    it("POST /user/verify-email - failure with empty token", async () => {
      (verifyEmail as jest.Mock<typeof verifyEmail>).mockRejectedValue(
        new Error("Invalid token"),
      );

      const response = await request(app)
        .post("/api/user/verify-email")
        .send({ token: "" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", "Token is required");
    });

    it("POST /user/verify-email - failure with different token type than string", async () => {
      (verifyEmail as jest.Mock<typeof verifyEmail>).mockRejectedValue(
        new Error("Invalid token type"),
      );

      const response = await request(app)
        .post("/api/user/verify-email")
        .send({ token: 123 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", "Not a string");
    });
  });
});
