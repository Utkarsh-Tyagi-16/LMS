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
    NODE_ENV: process.env.NODE_ENV || 'development'
});

const app = express();
const PORT = process.env.PORT || 8080;

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// CORS middleware
const allowedOrigins = [
  'http://localhost:5173',  // Local development
  'https://lms-frontend-omega.vercel.app'  // Production
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
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
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// MongoDB connection middleware
const connectDBMiddleware = async (req, res, next) => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await connectDB();
    console.log('MongoDB connection successful');
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection error',
      timestamp: new Date().toISOString()
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
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    success: false,
    message: "Route not found",
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ 
    success: false,
    message: "Internal server error",
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
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
