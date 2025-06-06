import React from "react";
import { Link, Outlet } from "react-router-dom";
import { ChartNoAxesColumn, SquareLibrary } from "lucide-react"; // Assuming you meant these icons

const Sidebar = () => {
  return (
    <div className="flex">
      <div className="hidden lg:block w-[250px] sm:w-[300px] space-y-8 border-r border-gray-300 dark:border-gray-700 p-5 sticky top-0 h-screen">
        <div className="mt-20 space-y-4">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <ChartNoAxesColumn size={22} />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/course" className="flex items-center gap-2">
            <SquareLibrary size={22} />
            <span>Courses</span>
          </Link>
        </div>
      </div>
      <div className="flex-1 md:p-24 p-2 bg-white dark:bg-gray-900">
        <Outlet/>
      </div>
    </div>
  );
};

export default Sidebar;
