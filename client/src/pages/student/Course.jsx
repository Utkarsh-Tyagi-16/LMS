import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Course = ({ course }) => {
  const instructorName = course?.creator?.name || "Unknown Instructor";
  const instructorPhoto = course?.creator?.photoUrl;
  const instructorInitials = instructorName
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Link to={`/course-detail/${course?._id}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={course?.courseThumbnail}
            alt={course?.courseTitle}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardContent className="px-5 py-4 space-y-3">
          <h1 className="font-bold text-lg truncate group-hover:text-blue-600 transition-colors">
            {course?.courseTitle || "Untitled Course"}
          </h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 border-2 border-blue-100 dark:border-blue-900">
                <AvatarImage
                  src={instructorPhoto}
                  alt={instructorName}
                />
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                  {instructorInitials}
                </AvatarFallback>
              </Avatar>
              <h1 className="font-medium text-sm text-gray-600 dark:text-gray-300">
                {instructorName}
              </h1>
            </div>
            <Badge className="bg-blue-600 text-white px-2 py-1 text-xs rounded-full">
              {course?.courseLevel || "Beginner"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
              <span>₹{course?.coursePrice ?? 0}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{course?.lectures?.length || 0} lectures</span>
              <span>•</span>
              <span>{course?.enrolledStudents?.length || 0} students</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default Course;
