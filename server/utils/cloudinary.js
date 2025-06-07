import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config({});

// Validate Cloudinary configuration
const requiredEnvVars = ['CLOUD_NAME', 'API_KEY', 'API_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.warn('Warning: Missing Cloudinary environment variables:', missingEnvVars);
    console.warn('Cloudinary functionality will be disabled. Please set these variables in your .env file');
} else {
    // Configure Cloudinary only if all required variables are present
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
    });
}

export const uploadMedia = async (file) => {
    try {
        if (!file) {
            throw new Error("No file provided");
        }

        // Check if Cloudinary is configured
        if (missingEnvVars.length > 0) {
            throw new Error("Cloudinary is not configured. Please set up your Cloudinary credentials in .env file");
        }

        console.log("Starting Cloudinary upload for file:", {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });

        // Convert buffer to base64
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;

        const uploadResponse = await cloudinary.uploader.upload(dataURI, {
            resource_type: "auto",
            chunk_size: 6000000, // 6MB chunks for video upload
            folder: "course_thumbnails" // Organize uploads in a folder
        });

        console.log("Cloudinary upload response:", {
            secure_url: uploadResponse.secure_url,
            public_id: uploadResponse.public_id,
            resource_type: uploadResponse.resource_type
        });

        return {
            secure_url: uploadResponse.secure_url,
            public_id: uploadResponse.public_id
        };
    } catch (error) {
        console.error("Cloudinary upload error:", {
            message: error.message,
            error: error
        });
        throw error;
    }
};

export const deleteMediaFromCloudinary = async (publicId) => {
    try {
        if (!publicId) {
            throw new Error("No public ID provided");
        }

        // Check if Cloudinary is configured
        if (missingEnvVars.length > 0) {
            throw new Error("Cloudinary is not configured. Please set up your Cloudinary credentials in .env file");
        }

        console.log("Deleting media from Cloudinary:", publicId);
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Media deletion result:", result);
        return result;
    } catch (error) {
        console.error("Cloudinary delete error:", {
            message: error.message,
            error: error
        });
        throw error;
    }
};

export const deleteVideoFromCloudinary = async (publicId) => {
    try {
        if (!publicId) {
            throw new Error("No public ID provided");
        }

        // Check if Cloudinary is configured
        if (missingEnvVars.length > 0) {
            throw new Error("Cloudinary is not configured. Please set up your Cloudinary credentials in .env file");
        }

        console.log("Deleting video from Cloudinary:", publicId);
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "video"
        });
        console.log("Video deletion result:", result);
        return result;
    } catch (error) {
        console.error("Cloudinary video delete error:", {
            message: error.message,
            error: error
        });
        throw error;
    }
};
  