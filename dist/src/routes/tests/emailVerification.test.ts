import request from "supertest";
import { beforeEach, describe, expect, jest, it } from "@jest/globals";
import express from "express";

import router from "../index";
import {
  requestExistingUserEmailVerification,
  verifyEmail,
} from "../../services/emailVerificationService";

jest.mock("../../services/emailVerificationService", () => ({
  verifyEmail: jest.fn(),
  requestExistingUserEmailVerification: jest.fn(),
}));

const app = express();
app.use(express.json());

// Mock authentication for tests: attach a user to `req.user`
app.use((req, _res, next) => {
  // @ts-ignore - test helper to mock authenticated user
  req.user = { id: { userId: "test-user-id" } };
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

  describe("Email Verification Request", () => {
    it("POST /user/request-email-verification - success", async () => {
      (
        requestExistingUserEmailVerification as jest.Mock<
          typeof requestExistingUserEmailVerification
        >
      ).mockResolvedValue({
        message: "Email verification request sent successfully",
        verificationLink: "http://example.com/verify-email",
      });

      const response = await request(app)
        .post("/api/user/request-email-verification")
        .send({ userId: "test-user-id" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty(
        "message",
        "Email verification request sent successfully",
      );
    });

    it("POST /user/request-email-verification - failure", async () => {
      (
        requestExistingUserEmailVerification as jest.Mock<
          typeof requestExistingUserEmailVerification
        >
      ).mockRejectedValue(new Error("User not found"));

      const response = await request(app)
        .post("/api/user/request-email-verification")
        .send();

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty(
        "message",
        "Email verification request failed",
      );
    });

    it("POST /user/request-email-verification - failure when user id missing", async () => {
      const appNoUser = express();
      appNoUser.use(express.json());
      // no user attached to req
      appNoUser.use((req, _res, next) => {
        // @ts-ignore
        req.user = undefined;
        next();
      });
      appNoUser.use("/api", router);

      const response = await request(appNoUser)
        .post("/api/user/request-email-verification")
        .send();

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty(
        "message",
        "Invalid input: expected object, received undefined",
      );
    });
  });
});
