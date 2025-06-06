// server.js or app.js
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './database/db.js';
import userRoute from "./routes/user.route.js";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import courseRoute from './routes/course.route.js';
import mediaRoute from './routes/media.route.js';
import purchaseRoute from './routes/purchaseCourse.route.js';
import { razorpayWebhook } from "./controllers/coursePurchase.controller.js";
import courseProgressRoute from "./routes/courseProgress.route.js";

// Load environment variables
dotenv.config();

// Debug: Log environment variables
console.log('Environment Variables:', {
    MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not Set',
    JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not Set',
    CLOUD_NAME: process.env.CLOUD_NAME ? 'Set' : 'Not Set',
    API_KEY: process.env.API_KEY ? 'Set' : 'Not Set',
    API_SECRET: process.env.API_SECRET ? 'Set' : 'Not Set',
    FRONTEND_URL: process.env.FRONTEND_URL ? 'Set' : 'Not Set',
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not Set',
    RAZORPAY_SECRET: process.env.RAZORPAY_SECRET ? 'Set' : 'Not Set'
});

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 8080;

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'x-razorpay-key',
    'x-razorpay-payment-id',
    'x-razorpay-signature',
    'x-razorpay-order-id'
  ]
}));

// Special handling for Razorpay webhook - must be before other middleware
app.post('/api/v1/purchase/razorpay-webhook', 
  express.raw({ type: 'application/json' }), 
  razorpayWebhook
);

// Body parsers for other routes
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());

// API Routes
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: "Route not found" 
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ 
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server only if not in production (Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

// Export the Express app for Vercel
export default app;
