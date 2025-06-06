import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetPurchasedCoursesQuery } from "@/features/api/purchaseApi";
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const Dashboard = () => {
  const {data, isError, isLoading} = useGetPurchasedCoursesQuery();

  if(isLoading) return <h1>Loading...</h1>
  if(isError) return <h1 className="text-red-500">Failed to get purchased course</h1>

  const purchasedCourse = data?.purchasedCourse || [];

  // Group purchases by course to get total sales and revenue per course
  const courseData = purchasedCourse.reduce((acc, purchase) => {
    const courseId = purchase.courseId._id;
    const courseTitle = purchase.courseId.courseTitle;
    const price = purchase.courseId.coursePrice;

    if (!acc[courseId]) {
      acc[courseId] = {
        name: courseTitle,
        price: price,
        sales: 0,
        revenue: 0
      };
    }

    acc[courseId].sales += 1;
    acc[courseId].revenue += purchase.amount;

    return acc;
  }, {});

  // Convert to array for chart
  const chartData = Object.values(courseData);

  const totalRevenue = purchasedCourse.reduce((acc, element) => acc + (element.amount || 0), 0);
  const totalSales = purchasedCourse.length;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-lg text-gray-800">{label}</p>
          <div className="space-y-2 mt-2">
            {payload.map((entry, index) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {entry.name === "Revenue" ? `₹${entry.value}` : entry.value}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 p-6">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <CardTitle className="text-xl text-gray-700">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">{totalSales}</p>
            <p className="text-sm text-gray-500 mt-2">Total number of course purchases</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-green-50 to-white">
          <CardHeader>
            <CardTitle className="text-xl text-gray-700">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">₹{totalRevenue}</p>
            <p className="text-sm text-gray-500 mt-2">Total earnings from all courses</p>
          </CardContent>
        </Card>
      </div>

      {/* Course Sales Overview Card */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-700">
            Course Sales Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 100
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={100}
                  tick={{
                    fontSize: 12,
                    fill: "#4b5563"
                  }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#4a90e2"
                  tick={{
                    fontSize: 12,
                    fill: "#4b5563"
                  }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#2ecc71"
                  tick={{
                    fontSize: 12,
                    fill: "#4b5563"
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{
                    paddingTop: "20px",
                    fontSize: "14px"
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="sales"
                  stroke="#4a90e2"
                  strokeWidth={3}
                  dot={{ stroke: "#4a90e2", strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                  name="Sales"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2ecc71"
                  strokeWidth={3}
                  dot={{ stroke: "#2ecc71", strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;