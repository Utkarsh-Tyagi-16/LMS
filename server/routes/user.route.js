import express from 'express';
import { register, login, getUserProfile, logout, updateProfile } from "../controllers/user.controller.js";
import isAuthenticated from '../middlewares/isAuthenticated.js';
import upload from "../utils/multer.js";
import { handleMulterError } from "../utils/multer.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/profile/update")
  .put(
    isAuthenticated,
    (req, res, next) => {
      console.log('Profile update request received:', {
        headers: req.headers,
        body: req.body,
        files: req.files
      });
      next();
    },
    upload.single("profilePhoto"),
    handleMulterError,
    updateProfile
  );

export default router;
