import express from "express";
import upload from "../utils/multer.js";
import { uploadMedia } from "../utils/cloudinary.js";

const router = express.Router();

router.route("/upload-video")
    .post(upload.single("file"), async(req,res) => {
        try {
            if (!req.file) {
                console.log("No file received in request");
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded"
                });
            }

            console.log("File received:", {
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path
            });

            // Check if file exists
            if (!req.file.path) {
                console.error("File path is missing");
                return res.status(400).json({
                    success: false,
                    message: "File path is missing"
                });
            }

            try {
                const result = await uploadMedia(req.file.path);
                console.log("Upload successful:", result);
                
                res.status(200).json({
                    success: true,
                    message: "File uploaded successfully.",
                    data: result
                });
            } catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                res.status(500).json({
                    success: false,
                    message: "Error uploading to Cloudinary",
                    error: uploadError.message
                });
            }
        } catch (error) {
            console.error("Video upload error:", error);
            res.status(500).json({
                success: false,
                message: "Error uploading file",
                error: error.message
            });
        }
    });

export default router;