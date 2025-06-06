import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useCreateCourseMutation } from "@/features/api/courseApi";
import { toast } from "sonner";
import { useEffect } from "react";



const AddCourse = () => {
    const [courseTitle, setCourseTitle] = React.useState("");
    const [category, setCategory] = React.useState("");

    const [createCourse, {data, isLoading, error, isSuccess}] = useCreateCourseMutation();

    const navigate = useNavigate();

    const getSelectedCategory = (value) => {
        setCategory(value);
      }

    const createCourseHandler = async () => {
        await createCourse({ courseTitle, category });
      }; 

      // for display of toast
      useEffect(() => {
        if (isSuccess) {
          toast.success(data?.message || "Course created successfully.");
          navigate("/admin/course");
        }

      },[isSuccess, error])


  return (
    <div className="flex-1 mx-10">
      <div className="mb-4">
        <h1 className="font-bold text-xl">
          Lets add course, add some basic course details for your new course
        </h1>
        <p className="text-sm">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Possimus,
          laborum!
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            placeholder="Your Course Name"
          />
        </div>
        <div>
          <Label>Category</Label>
          <Select onValueChange={getSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                <SelectItem value="Next JS">Next JS</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Javascript">Javascript</SelectItem>
                <SelectItem value="Python">Python</SelectItem>
                <SelectItem value="Docker">Docker</SelectItem>
                <SelectItem value="MongoDB">MongoDB</SelectItem>
                <SelectItem value="HTML">HTML</SelectItem>
                <SelectItem value="CSS">CSS</SelectItem>
                <SelectItem value="React">React</SelectItem>
                <SelectItem value="Node">Node</SelectItem>
                <SelectItem value="Express">Express</SelectItem>
                <SelectItem value="Tailwind">Tailwind</SelectItem>
                <SelectItem value="Bootstrap">Bootstrap</SelectItem>
                <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                <SelectItem value="Deep Learning">Deep Learning</SelectItem>
                <SelectItem value="AI">AI</SelectItem>
                <SelectItem value="ChatGPT">ChatGPT</SelectItem>
                <SelectItem value="Django">Django</SelectItem>
                <SelectItem value="Flask">Flask</SelectItem>
                <SelectItem value="GraphQL">GraphQL</SelectItem>
                <SelectItem value="Data Analysis">Data Analysis</SelectItem>
                <SelectItem value="Full Stack">Full Stack</SelectItem>
                <SelectItem value="MERN">MERN</SelectItem>
                <SelectItem value="MEAN">MEAN</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/admin/course")}>Back</Button>
            <Button disabled={isLoading} onClick={createCourseHandler}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Create"
            )}
            </Button>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
