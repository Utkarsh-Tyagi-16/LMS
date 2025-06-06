import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { uploadMedia, deleteMediaFromCloudinary, deleteVideoFromCloudinary } from "../utils/cloudinary.js";


export const createCourse = async (req,res) => {
    try {
        const {courseTitle, category} = req.body;
        if(!courseTitle || !category) {
            return res.status(400).json({
                message:"Course title and category is required."
            })
        }

        const course = await Course.create({
            courseTitle,
            category,
            creator:req.id
        });

        return res.status(201).json({
            course,
            message:"Course created."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create course"
        })
    }
}

export const getCreatorCourses = async (req,res) => {
    try {
        const userId = req.id;
        const courses = await Course.find({creator:userId});
        if(!courses){
            return res.status(404).json({
                courses:[],
                message:"Course not found"
            })
        };
        return res.status(200).json({
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create course"
        })
    }
}

export const editCourse = async (req,res) => {
    try {
        const courseId = req.params.courseId;
        const {courseTitle, subTitle, description, category, courseLevel, coursePrice} = req.body;
        const thumbnail = req.file;

        console.log('Edit Course Request:', {
            courseId,
            body: req.body,
            file: thumbnail ? {
                filename: thumbnail.filename,
                mimetype: thumbnail.mimetype,
                size: thumbnail.size
            } : null
        });

        // Validate courseId
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required"
            });
        }

        let course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                success: false,
                message: "Course not found!"
            });
        }

        // Validate required fields
        if(!courseTitle || !category) {
            return res.status(400).json({
                success: false,
                message: "Course title and category are required."
            });
        }

        let courseThumbnail;
        if(thumbnail){
            try {
                // Delete old thumbnail if exists
                if(course.courseThumbnail){
                    try {
                        const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
                        await deleteMediaFromCloudinary(publicId);
                    } catch (deleteError) {
                        console.error("Error deleting old thumbnail:", deleteError);
                        // Continue with update even if old thumbnail deletion fails
                    }
                }

                // Upload new thumbnail
                try {
                    courseThumbnail = await uploadMedia(thumbnail.path);
                    console.log('New thumbnail uploaded:', courseThumbnail);
                } catch (uploadError) {
                    console.error("Error uploading thumbnail:", uploadError);
                    return res.status(500).json({
                        success: false,
                        message: "Failed to upload course thumbnail. Please try again."
                    });
                }
            } catch (error) {
                console.error("Error handling thumbnail:", error);
                return res.status(500).json({
                    success: false,
                    message: "Failed to process course thumbnail"
                });
            }
        }

        // Prepare update data
        const updateData = {
            courseTitle, 
            subTitle, 
            description, 
            category, 
            courseLevel, 
            coursePrice: coursePrice ? Number(coursePrice) : undefined
        };

        // Only update thumbnail if we have a new one
        if (courseThumbnail?.secure_url) {
            updateData.courseThumbnail = courseThumbnail.secure_url;
        }

        console.log('Updating course with data:', updateData);

        // Update course
        try {
            course = await Course.findByIdAndUpdate(
                courseId, 
                updateData, 
                { new: true }
            );

            if (!course) {
                throw new Error('Course not found after update');
            }

            return res.status(200).json({
                success: true,
                course,
                message: "Course updated successfully."
            });
        } catch (updateError) {
            console.error("Error updating course:", updateError);
            return res.status(500).json({
                success: false,
                message: "Failed to update course. Please try again.",
                error: updateError.message
            });
        }
    } catch (error) {
        console.error("Error in editCourse:", error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred. Please try again.",
            error: error.message
        });
    }
}

export const getCourseById = async (req,res) => {
    try {
        const {courseId} = req.params;

        const course = await Course.findById(courseId);

        if(!course){
            return res.status(404).json({
                message:"Course not found!"
            })
        }
        return res.status(200).json({
            course
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get course by id"
        })
    }
}

export const createLecture = async (req,res) => {
    try {
        const {lectureTitle} = req.body;
        const {courseId} = req.params;

        if(!lectureTitle || !courseId){
            return res.status(400).json({
                message:"Lecture title is required"
            })
        };

        // create lecture
        const lecture = await Lecture.create({lectureTitle});

        const course = await Course.findById(courseId);
        if(course){
            course.lectures.push(lecture._id);
            await course.save();
        }

        return res.status(201).json({
            lecture,
            message:"Lecture created successfully."
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create lecture"
        })
    }
}

export const searchCourse = async (req,res) => {
    try {
        const {query = "", categories = [], sortByPrice =""} = req.query;
        console.log(categories);
        
        // create search query
        const searchCriteria = {
            isPublished:true,
            $or:[
                {courseTitle: {$regex:query, $options:"i"}},
                {subTitle: {$regex:query, $options:"i"}},
                {category: {$regex:query, $options:"i"}},
            ]
        }

        // if categories selected
        if(categories.length > 0) {
            searchCriteria.category = {$in: categories};
        }

        // define sorting order
        const sortOptions = {};
        if(sortByPrice === "low"){
            sortOptions.coursePrice = 1;//sort by price in ascending
        }else if(sortByPrice === "high"){
            sortOptions.coursePrice = -1; // descending
        }

        let courses = await Course.find(searchCriteria).populate({path:"creator", select:"name photoUrl"}).sort(sortOptions);

        return res.status(200).json({
            success:true,
            courses: courses || []
        });

    } catch (error) {
        console.log(error);
        
    }
}

export const getPublishedCourse = async (_,res) => {
    try {
        const courses = await Course.find({isPublished:true}).populate({path:"creator", select:"name photoUrl"});
        if(!courses){
            return res.status(404).json({
                message:"Course not found"
            })
        }
        return res.status(200).json({
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get published courses"
        })
    }
}

export const getCourseLecture = async (req,res) => {
    try {
        const {courseId} = req.params;
        const course = await Course.findById(courseId).populate("lectures");
        if(!course){
            return res.status(404).json({
                message:"Course not found"
            })
        }
        return res.status(200).json({
            lectures: course.lectures
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get lectures"
        })
    }
}

export const editLecture = async (req,res) => {
    try {
        const {lectureTitle, videoInfo, isPreviewFree} = req.body;
        
        const {courseId, lectureId} = req.params;
        const lecture = await Lecture.findById(lectureId);
        if(!lecture){
            return res.status(404).json({
                message:"Lecture not found!"
            })
        }

        // update lecture
        if(lectureTitle) lecture.lectureTitle = lectureTitle;
        if(videoInfo?.videoUrl) {
            lecture.videoUrl = videoInfo.videoUrl;
            lecture.publicId = videoInfo.publicId;
        }
        lecture.isPreviewFree = isPreviewFree;
        
        await lecture.save();

        // Ensure the course still has the lecture id if it was not aleardy added;
        const course = await Course.findById(courseId);
        if(course && !course.lectures.includes(lecture._id)){
            course.lectures.push(lecture._id);
            await course.save();
        };
        return res.status(200).json({
            lecture,
            message:"Lecture updated successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to edit lectures"
        })
    }
}


export const removeLecture = async (req,res) => {
    try {
        const {lectureId} = req.params;
        const lecture = await Lecture.findByIdAndDelete(lectureId);
        if(!lecture){
            return res.status(404).json({
                message:"Lecture not found!"
            });
        }
        // delete the lecture from couldinary as well
        if(lecture.publicId){
            await deleteVideoFromCloudinary(lecture.publicId);
        }

        // Remove the lecture reference from the associated course
        await Course.updateOne(
            {lectures:lectureId}, // find the course that contains the lecture
            {$pull:{lectures:lectureId}} // Remove the lectures id from the lectures array
        );

        return res.status(200).json({
            message:"Lecture removed successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to remove lecture"
        })
    }
}

export const getLectureById = async (req,res) => {
    try {
        const {lectureId} = req.params;
        const lecture = await Lecture.findById(lectureId);
        if(!lecture){
            return res.status(404).json({
                message:"Lecture not found!"
            });
        }
        return res.status(200).json({
            lecture
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get lecture by id"
        })
    }
}

export const togglePublishCourse = async (req,res) => {
    try {
        const {courseId} = req.params;
        const {publish} = req.query; // true, false
        const course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                message:"Course not found!"
            });
        }
        // publish status based on the query paramter
        course.isPublished = publish === "true";
        await course.save();

        const statusMessage = course.isPublished ? "Published" : "Unpublished";
        return res.status(200).json({
            message:`Course is ${statusMessage}` 
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to update status"
        })
    }
}
