import { Router } from "express";
// import {login, logout, refreshToken} from "../controllers/authController";
import { register, login } from "../controllers/authController";
const router = Router();

// register route
router.post("/register", register);
// login route
router.post("/login", login);

router

// chrome extention session route
// google OAuth route

export default router;
