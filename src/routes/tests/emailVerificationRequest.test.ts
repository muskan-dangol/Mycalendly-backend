import request from "supertest";
import express from "express";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import router from "../index";
import { requestExistingUserEmailVerification } from "../../services/emailVerificationService";

jest.mock("../../services/emailVerificationService", () => ({
  requestExistingUserEmailVerification: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use((req, _res, next) => {
  // @ts-ignore - test helper to mock authenticated user
  req.user = { id: "test-user-id" } as any;
  next();
});
app.use("/api", router);

describe("Email Verification Request", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  
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
    expect(response.body).toHaveProperty("message", "User ID is required");
  });
});
