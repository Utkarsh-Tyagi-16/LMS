import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { useEditLectureMutation, useRemoveLectureMutation } from "@/features/api/courseApi";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useGetLectureByIdQuery } from "@/features/api/courseApi";

const MEDIA_API = "http://localhost:8080/api/v1/media";

const LectureTab = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [uploadVideInfo, setUploadVideoInfo] = useState(null);
  const [isFree, setIsFree] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { courseId, lectureId } = useParams();

  const { data: lectureData } = useGetLectureByIdQuery(lectureId);
  const lecture = lectureData?.lecture;

  useEffect(() => {
    if (lecture) {
      setLectureTitle(lecture.lectureTitle);
      setIsFree(lecture.isPreviewFree);
      setUploadVideoInfo(lecture.videoInfo);
    }
  }, [lecture]);

  const [editLecture, { data, isLoading, error, isSuccess }] = useEditLectureMutation();
  const [removeLecture, { data: removeData, isLoading: removeLoading, isSuccess: removeSuccess }] = useRemoveLectureMutation();

  const fileChangeHandler = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a valid video file');
        return;
      }

      // Validate file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        toast.error('File size should be less than 100MB');
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      setMediaProgress(true);
      try {
        const res = await axios.post(`${MEDIA_API}/upload-video`, formData, {
          onUploadProgress: ({ loaded, total }) => {
            setUploadProgress(Math.round((loaded * 100) / total));
          },
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (res.data.success) {
          setUploadVideoInfo({
            videoUrl: res.data.data.url,
            publicId: res.data.data.public_id,
          });
          toast.success(res.data.message);
        }
      } catch (error) {
        console.error("Video upload error:", error);
        const errorMessage = error.response?.data?.message || error.response?.data?.error || "Video upload failed";
        toast.error(errorMessage);
      } finally {
        setMediaProgress(false);
        setUploadProgress(0);
      }
    }
  };

  const editLectureHandler = async () => {
    await editLecture({
      lectureTitle,
      videoInfo: uploadVideInfo,
      isPreviewFree: isFree,
      courseId,
      lectureId,
    });
  };

  const removeLectureHandler = async () => {
    try {
      await removeLecture({ courseId, lectureId });
    } catch (error) {
      console.error("Error removing lecture:", error);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message);
    }

    if (error) {
      toast.error(error?.data?.message || "An error occurred while editing the lecture");
    }

    if (removeLoading) {
      toast.loading("Removing lecture...", { id: "removeLoading" });
    }

    if (removeSuccess) {
      toast.success(removeData?.message, { id: "removeLoading" });
    }

    if (!removeLoading && !removeSuccess && removeData) {
      toast.error(removeData?.message, { id: "removeLoading" });
    }
  }, [isSuccess, error, removeSuccess, removeLoading, data, removeData]);

  return (
    <div>
      <Card>
        <CardHeader className="flex justify-between">
          <div>
            <CardTitle>Edit Lecture</CardTitle>
            <CardDescription>
              Make changes and click save when you are done.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              disabled={removeLoading}
              variant="destructive"
              onClick={removeLectureHandler}
            >
              {removeLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Remove Lecture"
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="my-1">Title</Label>
            <Input
              value={lectureTitle}
              onChange={(e) => setLectureTitle(e.target.value)}
              type="text"
              placeholder="Ex. Introduction to Javascript"
            />
          </div>
          <div className="my-5">
            <Label className="my-1">
              Video <span className="text-red-500">*</span>
            </Label>
            <Input
              type="file"
              accept="video/*"
              onChange={fileChangeHandler}
              placeholder="Ex. Introduction to Javascript"
              className="w-fit"
            />
          </div>
          <div className="flex items-center space-x-2 my-5">
            <Switch id="airplane-mode" checked={isFree} onCheckedChange={setIsFree} />
            <Label htmlFor="airplane-mode">Is this video FREE</Label>
          </div>
          {mediaProgress && (
            <div className="my-4">
              <Progress value={uploadProgress} />
              <p>{uploadProgress}% uploaded</p>
            </div>
          )}
          <div className="mt-4">
            <Button disabled={isLoading} onClick={editLectureHandler}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Update Lecture"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LectureTab;
