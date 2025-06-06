import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { useParams, Navigate } from "react-router-dom";

const PurchaseCourseProtectedRoute = ({children}) => {
    const {courseId} = useParams();
    const {data, isLoading} = useGetCourseDetailWithStatusQuery(courseId);

    if(isLoading) return <p>Loading...</p>

    // If the course is purchased, show the course progress page
    // If not purchased, redirect to course detail page
    return data?.purchased ? children : <Navigate to={`/course-detail/${courseId}`} replace />
}

export default PurchaseCourseProtectedRoute;