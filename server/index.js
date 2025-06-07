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
    MONGO_URI: process.env.MONGO_URI ? 'Set' : 'Not Set',
    SECRET_KEY: process.env.SECRET_KEY ? 'Set' : 'Not Set',
    CLOUD_NAME: process.env.CLOUD_NAME ? 'Set' : 'Not Set',
    API_KEY: process.env.API_KEY ? 'Set' : 'Not Set',
    API_SECRET: process.env.API_SECRET ? 'Set' : 'Not Set',
    FRONTEND_URL: process.env.FRONTEND_URL ? 'Set' : 'Not Set',
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not Set',
    RAZORPAY_SECRET: process.env.RAZORPAY_SECRET ? 'Set' : 'Not Set'
});

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// MongoDB connection middleware
const connectDBMiddleware = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    // Don't send error details in production
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Database connection error' 
      : error.message;
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};

// Apply MongoDB connection middleware to all API routes
app.use('/api', connectDBMiddleware);

// API Routes
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);

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
  // Don't send error details in production
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(500).json({ 
    success: false,
    message: errorMessage
  });
});

// Initialize server only in development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

// Export the Express app for Vercel
export default app;
