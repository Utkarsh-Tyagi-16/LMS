# Learning Management System (LMS)

A full-stack Learning Management System built with React, Node.js, and MongoDB.

## Features

- User authentication and authorization
- Course creation and management
- Video lecture upload and streaming
- Course purchase and payment integration
- Course progress tracking
- Responsive design

## Tech Stack

### Frontend
- React
- Redux Toolkit
- Tailwind CSS
- Vite
- React Router
- React Player

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Cloudinary (for media storage)
- Razorpay (for payments)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Cloudinary account
- Razorpay account

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd lms
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Environment Variables:

Create `.env` files in both server and client directories:

Server (.env):
```
PORT=8080
MONGO_URI=your_mongodb_uri
SECRET_KEY=your_jwt_secret
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret
```

Client (.env):
```
VITE_API_URL=http://localhost:8080/api/v1
```

4. Start the development servers:

```bash
# Start backend server
cd server
npm run dev

# Start frontend server
cd ../client
npm run dev
```

## API Endpoints

### Authentication
- POST /api/v1/user/register - Register a new user
- POST /api/v1/user/login - Login user
- GET /api/v1/user/logout - Logout user

### Courses
- GET /api/v1/course/published-courses - Get all published courses
- POST /api/v1/course - Create a new course
- GET /api/v1/course/:id - Get course by ID
- PUT /api/v1/course/:id - Update course
- DELETE /api/v1/course/:id - Delete course

### Lectures
- POST /api/v1/course/:courseId/lecture - Add lecture to course
- GET /api/v1/course/:courseId/lecture - Get course lectures
- PUT /api/v1/course/:courseId/lecture/:lectureId - Update lecture
- DELETE /api/v1/course/:courseId/lecture/:lectureId - Delete lecture

### Purchases
- POST /api/v1/purchase/checkout/create-checkout-session - Create checkout session
- GET /api/v1/purchase/course/:courseId/detail-with-status - Get course purchase status
- GET /api/v1/purchase - Get user's purchased courses

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 