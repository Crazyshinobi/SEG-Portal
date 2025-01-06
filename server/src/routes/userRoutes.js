import express from "express";
import {
  createUser,
  deleteUser,
  forgotPassword,
  getUsers,
  loginUser,
  resetPassword,
  verifyOtp,
} from "../controllers/userController.js";

const router = express.Router();

router.route("/login").post(loginUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
router.route("/verify-otp").post(verifyOtp);
router.route("/").post(createUser).get(getUsers);
router.route("/:id").delete(deleteUser);

export { router };
