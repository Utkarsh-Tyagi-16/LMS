import { Button } from "@/components/ui/button";
import { useRouteError, useNavigate } from "react-router-dom";

const ErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-4 p-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {error?.statusText || error?.message || "An unexpected error occurred"}
        </p>
        <div className="space-x-4">
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
          <Button onClick={() => navigate("/")}>
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary; 