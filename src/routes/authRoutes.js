import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  refreshToken,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.post("/refresh", protect, refreshToken); // will remove (removed expiry)

export default router;
