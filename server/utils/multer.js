import multer from "multer";
import path from "path";

// Configure storage to use memory instead of disk
const storage = multer.memoryStorage();

// File filter for different routes
const fileFilter = (req, file, cb) => {
    // Check if this is a video upload route
    if (req.originalUrl.includes('/upload-video')) {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed!'), false);
        }
    } 
    // For course thumbnail and profile photo
    else if (req.originalUrl.includes('/course') || req.originalUrl.includes('/profile')) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
    // Default case
    else {
        cb(new Error('Invalid file type!'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max file size
    }
});

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 100MB'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next(err);
};

// Export both default and named exports
export { handleMulterError };
export default upload;