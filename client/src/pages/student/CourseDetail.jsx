import BuyCourseButton from "@/components/BuyCourseButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";

import { BadgeInfo, PlayCircle, Lock } from "lucide-react";
import React from "react";
import ReactPlayer from "react-player";
import { useParams, useNavigate } from "react-router-dom";

const CourseDetail = () => {
    const params = useParams();
    const navigate = useNavigate();
    const courseId = params.courseId;
    const {data, isLoading, isError} = useGetCourseDetailWithStatusQuery(courseId);

    if(isLoading) return <h1>Loading...</h1>
    if(isError) return <h1>Failed to load course details</h1>
    if(!data) return <h1>No course data available</h1>

    const {course, purchased} = data;

    // Get the first lecture's video URL if available
    const previewVideoUrl = course?.lectures?.[0]?.videoUrl;

    const handleContinueCourse = () => {
        navigate(`/course-progress/${courseId}`);
    };

    return (
      <div className="mt-15 space-y-5">
        <div className="bg-[#2D2F31] text-white">
          <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 flex flex-col gap-2">
            <h1 className="font-bold text-2xl md:text-3xl">{course?.courseTitle}</h1>
            <p className="text-base md:text-lg">{course?.subTitle}</p>
            <p>
              Created By{" "}
              <span className="text-[#C0C4FC] underline italic">
                {course?.creator?.name}
              </span>
            </p>
            <div className="flex items-center gap-2 text-sm">
              <BadgeInfo size={16} />
              <p>Last Updated {course?.createdAt?.split("T")[0]}</p>
            </div>
            <p>Student enrolled: {course?.enrolledStudents?.length || 0}</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto my-5 px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-10">
          <div className="w-full lg:w-1/2 space-y-5">
            <h1 className="font-bold text-xl md:text-2xl">Description</h1>
            <div 
              className="text-sm prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: course?.description }}
            />
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>{course?.lectures?.length || 0} Lectures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {course?.lectures?.map((lecture, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    {purchased || lecture.isPreviewFree ? <PlayCircle size={14} /> : <Lock size={14} />}
                    <p>{lecture?.lectureTitle}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="w-full lg:w-1/3">
            <Card>
              <CardContent className="p-4 flex flex-col">
                <div className="w-full aspect-video mb-4 bg-black">
                  {previewVideoUrl ? (
                    <ReactPlayer 
                      url={previewVideoUrl}
                      controls={true}
                      width="100%"
                      height="100%"
                      config={{
                        file: {
                          attributes: {
                            controlsList: 'nodownload'
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      No preview video available
                    </div>
                  )}
                </div>
                <h1>
                  {course?.lectures?.[0]?.lectureTitle || "Preview Lecture"}
                </h1>
                <Separator className="my-2"/>
                <h1 className="text-lg md:text-xl font-semibold">₹{course?.coursePrice || 0}</h1>
              </CardContent>
              <CardFooter className="flex justify-center p-4">
                {purchased ? (
                  <Button className="w-full" onClick={handleContinueCourse}>
                    Continue Course
                  </Button>
                ) : (
                  <BuyCourseButton courseId={courseId}/>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
};

export default CourseDetail;
