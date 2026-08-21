import request from "supertest";
import express from "express";
import { beforeEach, describe, expect, jest, it } from "@jest/globals";

import router from "../dist/src/routes/index";
import { registerUser, loginUser } from "../dist/src/services/authSerivce";

jest.mock("../dist/src/services/authSerivce", () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use("/api", router);

describe("Auth API /register", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("POST /api/auth/register - success", async () => {
    (registerUser as jest.Mock<typeof registerUser>).mockResolvedValue({
      user: {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        emailVerified: false,
      },
      token: "token123",
    });

    const payload = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
    };

    const res = await request(app).post("/api/auth/register").send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("token", "token123");
    expect(res.body.message).toContain("User registered successfully");
  });

  it("POST /api/auth/register - validation failure", async () => {
    const payload = { email: "not-an-email", password: "123" };
    const res = await request(app).post("/api/auth/register").send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("success", false);
    expect(res.body).toHaveProperty("error");
    expect(res.body.message).toContain("Validation failed");
  });
});

describe("Auth API /login", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("POST /api/auth/login - Validation failed", async () => {
    (loginUser as jest.Mock<typeof loginUser>).mockResolvedValue({
      user: {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        emailVerified: false,
      },
      token: "tok-login",
    });

    const payload = { email: "john@example.com", password: "pass" };
    const res = await request(app).post("/api/auth/login").send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("success", false);
    expect(res.body).toHaveProperty("error");
    expect(res.body.message).toContain("Validation failed");
  });

  it("POST /api/auth/login - success", async () => {
    (loginUser as jest.Mock<typeof loginUser>).mockResolvedValue({
      user: {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        emailVerified: false,
      },
      token: "tok-login",
    });

    const payload = { email: "john@example.com", password: "password123" };
    const res = await request(app).post("/api/auth/login").send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.data).toHaveProperty("token", "tok-login");
    expect(res.body.message).toContain("User logged in successfully");
  });

  it("POST /api/auth/login - invalid credentials", async () => {
    (loginUser as jest.Mock<typeof loginUser>).mockImplementation(() => {
      throw new Error("Invalid password");
    });

    const payload = { email: "john@example.com", password: "wrongpass" };
    const res = await request(app).post("/api/auth/login").send(payload);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("success", false);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toContain("Invalid password");
  });

  it("POST /api/auth/login - user not found", async () => {
    (loginUser as jest.Mock<typeof loginUser>).mockImplementation(() => {
      throw new Error("User not found");
    });

    const payload = { email: "jonny@example.com", password: "anypassword" };
    const res = await request(app).post("/api/auth/login").send(payload);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("success", false);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toContain("User not found");
  });
});
