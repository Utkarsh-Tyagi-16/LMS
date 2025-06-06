import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createCourse, createLecture, getCourseLecture, getPublishedCourse, togglePublishCourse } from "../controllers/course.controller.js";
import { getCreatorCourses } from "../controllers/course.controller.js";
import { editCourse } from "../controllers/course.controller.js";
import upload from "../utils/multer.js";
import { getCourseById } from "../controllers/course.controller.js";
import { editLecture } from "../controllers/course.controller.js";
import { removeLecture } from "../controllers/course.controller.js";
import { getLectureById } from "../controllers/course.controller.js";
import { searchCourse } from "../controllers/course.controller.js";




const router = express.Router();

router.route("/").post(isAuthenticated,createCourse);
router.route("/search").get(isAuthenticated, searchCourse);
router.route("/published-courses").get( getPublishedCourse);
router.route("/").get(isAuthenticated,getCreatorCourses);
router.route("/:courseId").put(isAuthenticated,upload.single("courseThumbnail"),editCourse);
router.route("/:courseId").get(isAuthenticated, getCourseById);
router.route("/:courseId/lecture").post(isAuthenticated, createLecture);
router.route("/:courseId/lecture").get(isAuthenticated, getCourseLecture);
router.route("/:courseId/lecture/:lectureId").put(isAuthenticated, editLecture);
// Backend Route (with courseId)
router.route("/:courseId/lecture/:lectureId").delete(isAuthenticated, removeLecture);
router.route("/lecture/:lectureId").get(isAuthenticated, getLectureById);
router.route("/:courseId").patch(isAuthenticated, togglePublishCourse);



export default router;