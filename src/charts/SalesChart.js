import React, { useEffect, useState } from "react";
import { useAuth } from "../authentication/AuthContext";
import { fetchSellerSales } from "../services/OrderServices";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#F44336", "#9C27B0"];

const SalesChart = () => {
  const { authState } = useAuth();
  const [sales, setSales] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("monthly");

  useEffect(() => {
    const loadSales = async () => {
      if (!authState.token) {
        setError("User is not authenticated");
        return;
      }
      setLoading(true);
      try {
        const fetchedSales = await fetchSellerSales(authState.token);
        setSales(fetchedSales);
      } catch (err) {
        setError(err.message || "Failed to fetch sales");
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, [authState.token]);

  if (loading) {
    return <div className="text-center py-6">Loading charts...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-6">Error: {error}</div>;
  }

  if (!sales || sales.length === 0) {
    return <div className="text-center text-gray-500 py-6">No sales data available.</div>;
  }

  const getWeekNumber = (date) => {
    const firstJan = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + firstJan.getDay() + 1) / 7);
  };

  const groupSalesData = (sales, filter) => {
    return sales.reduce((acc, sale) => {
      const date = new Date(sale.createdAt);
      let key;

      if (filter === "daily") {
        key = date.toLocaleDateString();
      } else if (filter === "weekly") {
        key = `Week ${getWeekNumber(date)}`;
      } else {
        key = date.toLocaleString("default", { month: "short" });
      }

      const existingEntry = acc.find((item) => item.key === key);
      if (existingEntry) {
        existingEntry.revenue += sale.amount;
      } else {
        acc.push({ key, revenue: sale.amount });
      }
      return acc;
    }, []);
  };

  const salesData = groupSalesData(sales, filter);

  const statusDistribution = sales.reduce((acc, sale) => {
    const status = sale.status.toLowerCase();
    const existingStatus = acc.find((item) => item.status === status);
    if (existingStatus) {
      existingStatus.count += 1;
    } else {
      acc.push({ status, count: 1 });
    }
    return acc;
  }, []);

  return (
    <div className="py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-end mb-4">
          <select
            className="p-2 border rounded"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>{filter.charAt(0).toUpperCase() + filter.slice(1)} Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <XAxis dataKey="key" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="#2196F3" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusDistribution} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;
