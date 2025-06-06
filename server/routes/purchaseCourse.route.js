import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { 
  createCheckoutSession, 
  verifyPayment,
  razorpayWebhook,
  getCourseDetailWithPurchaseStatus,
  getAllPurchasedCourse,
} from "../controllers/coursePurchase.controller.js";

const router = express.Router();

router.route("/checkout/create-checkout-session").post(isAuthenticated, createCheckoutSession);
router.route("/verify-payment").post(verifyPayment);
router.route("/razorpay-webhook").post(razorpayWebhook);
router.route("/course/:courseId/detail-with-status").get(isAuthenticated, getCourseDetailWithPurchaseStatus);
router.route("/").get(isAuthenticated, getAllPurchasedCourse);

export default router;