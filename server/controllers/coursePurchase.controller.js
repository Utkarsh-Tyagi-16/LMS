import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

export const createCheckoutSession = async (req, res) => {
  try {
    console.log("Request user ID:", req.id);
    console.log("Request body:", req.body);

    const userId = req.id;
    // Handle both direct courseId and nested courseId object
    const courseId = typeof req.body.courseId === 'object' ? req.body.courseId.courseId : req.body.courseId;
    
    console.log("Extracted courseId:", courseId);
    console.log("Is valid ObjectId:", mongoose.Types.ObjectId.isValid(courseId));

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: user ID missing" });
    }

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ 
        message: "Invalid or missing courseId",
        details: {
          courseIdProvided: !!courseId,
          isValidObjectId: mongoose.Types.ObjectId.isValid(courseId),
          courseIdValue: courseId
        }
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found!" });
    }

    // Create a new course purchase record
    const newPurchase = new CoursePurchase({
      courseId,
      userId,
      amount: course.coursePrice,
      status: "pending",
    });

    try {
      // Create Razorpay order
      const order = await razorpay.orders.create({
        amount: course.coursePrice * 100, // Amount in paise
        currency: "INR",
        receipt: `rcpt_${courseId.slice(-6)}_${userId.slice(-6)}`, // Shorter receipt ID
        notes: {
          courseId: courseId,
          userId: userId,
        },
      });

      if (!order) {
        return res.status(400).json({
          success: false,
          message: "Error while creating order",
        });
      }

      // Save the purchase record with paymentId
      newPurchase.paymentId = order.id;
      await newPurchase.save();

      return res.status(200).json({
        success: true,
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        courseTitle: course.courseTitle,
        courseThumbnail: course.courseThumbnail,
      });
    } catch (razorpayError) {
      console.error("Razorpay Error:", razorpayError);
      return res.status(500).json({
        success: false,
        message: "Error creating Razorpay order",
        error: razorpayError.message
      });
    }
  } catch (error) {
    console.error("createCheckoutSession error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment details" });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    const purchase = await CoursePurchase.findOne({
      paymentId: razorpay_order_id,
    }).populate({ path: "courseId" });

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    purchase.status = "completed";

    // Make all lectures visible by setting `isPreviewFree` to true
    if (purchase.courseId && purchase.courseId.lectures && purchase.courseId.lectures.length > 0) {
      await Lecture.updateMany(
        { _id: { $in: purchase.courseId.lectures } },
        { $set: { isPreviewFree: true } }
      );
    }

    await purchase.save();

    // Update user's enrolledCourses with populated creator field
    const updatedUser = await User.findByIdAndUpdate(
      purchase.userId,
      { $addToSet: { enrolledCourses: purchase.courseId._id } },
      { new: true }
    ).populate({
      path: "enrolledCourses",
      populate: {
        path: "creator",
        select: "name photoUrl"
      }
    });

    // Update course to add user ID to enrolledStudents
    await Course.findByIdAndUpdate(
      purchase.courseId._id,
      { $addToSet: { enrolledStudents: purchase.userId } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("verifyPayment error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    console.log("Webhook received with headers:", req.headers);
    
    // Parse the raw body if it's a Buffer
    const body = Buffer.isBuffer(req.body) ? req.body.toString() : req.body;
    console.log("Webhook body:", body);

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not set");
      return res.status(500).json({ message: "Webhook secret not configured" });
    }

    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(body);
    const digest = shasum.digest("hex");

    const signature = req.headers["x-razorpay-signature"];
    console.log("Signature verification:", {
      received: signature,
      calculated: digest,
      match: signature === digest
    });

    if (signature !== digest) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const event = JSON.parse(body);
    console.log("Webhook event type:", event.event);

    if (event.event === "payment.captured") {
      const { order_id } = event.payload.payment.entity;
      console.log("Processing payment for order:", order_id);

      const purchase = await CoursePurchase.findOne({
        paymentId: order_id,
      }).populate({ path: "courseId" });

      if (!purchase) {
        console.log("Purchase not found for order:", order_id);
        return res.status(404).json({ message: "Purchase not found" });
      }

      purchase.status = "completed";

      // Make all lectures visible
      if (purchase.courseId && purchase.courseId.lectures && purchase.courseId.lectures.length > 0) {
        await Lecture.updateMany(
          { _id: { $in: purchase.courseId.lectures } },
          { $set: { isPreviewFree: true } }
        );
      }

      await purchase.save();

      // Update user's enrolledCourses with populated creator field
      const updatedUser = await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: purchase.courseId._id } },
        { new: true }
      ).populate({
        path: "enrolledCourses",
        populate: {
          path: "creator",
          select: "name photoUrl"
        }
      });

      // Update course to add user ID to enrolledStudents
      await Course.findByIdAndUpdate(
        purchase.courseId._id,
        { $addToSet: { enrolledStudents: purchase.userId } },
        { new: true }
      );

      console.log("Payment processed successfully for order:", order_id);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
};

export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId)
      .populate({ path: "creator" })
      .populate({ path: "lectures" });

    const purchased = await CoursePurchase.findOne({ userId, courseId });
    console.log(purchased);

    if (!course) {
      return res.status(404).json({ message: "course not found!" });
    }

    return res.status(200).json({
      course,
      purchased: !!purchased, // true if purchased, false otherwise
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllPurchasedCourse = async (req, res) => {
  try {
    const userId = req.id; // Get the user ID from the authenticated request

    // First, get all courses created by this instructor
    const instructorCourses = await Course.find({ creator: userId });

    // Get all purchases for these courses
    const purchasedCourse = await CoursePurchase.find({
      courseId: { $in: instructorCourses.map(course => course._id) },
      status: "completed",
    }).populate({
      path: "courseId",
      populate: {
        path: "lectures",
      },
    });

    return res.status(200).json({
      success: true,
      purchasedCourse: purchasedCourse || [],
    });
  } catch (error) {
    console.error("getAllPurchasedCourse error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

