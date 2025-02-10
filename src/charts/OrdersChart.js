import React, { useEffect, useState } from "react";
import { useAuth } from "../authentication/AuthContext";
import { fetchOrders } from "../services/OrderServices";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const OrdersChart = () => {
  const { authState } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeFrame, setTimeFrame] = useState("weekly");

  useEffect(() => {
    const loadOrders = async () => {
      if (!authState.token) {
        setError("User is not authenticated");
        return;
      }
      setLoading(true);
      try {
        const fetchedOrders = await fetchOrders(authState.token);
        setOrders(fetchedOrders);
      } catch (err) {
        setError(err.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [authState.token]);

  const groupOrdersData = (orders, timeFrame) => {
    const now = new Date();
    return orders.reduce((acc, order) => {
      const date = new Date(order.createdAt);
      let key;
      if (timeFrame === "daily") {
        key = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else if (timeFrame === "weekly") {
        key = date.toLocaleDateString([], { weekday: "short" });
      } else {
        key = date.toLocaleDateString([], { day: "numeric", month: "short" });
      }
      const existingEntry = acc.find((item) => item.key === key);
      if (existingEntry) {
        existingEntry.total += order.amount;
        existingEntry.orders += 1;
      } else {
        acc.push({ key, total: order.amount, orders: 1 });
      }
      return acc;
    }, []);
  };

  const ordersData = groupOrdersData(orders, timeFrame);

  const calculateTotalSpent = () => {
    return ordersData.reduce((sum, item) => sum + item.total, 0).toFixed(2);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!orders.length) return <p>No orders found.</p>;

  return (
    <div className="container mx-auto px-4 max-w-6xl py-6">
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Expenditure Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">View expenditure for:</label>
              <select
                className="mt-1 block w-full border-gray-300 rounded-md"
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value)}
              >
                <option value="daily">Today</option>
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
              </select>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${calculateTotalSpent()} <span className="text-sm font-normal text-gray-500">total spent</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Spending Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ordersData}>
                <XAxis dataKey="key" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                <Bar dataKey="total" fill="#2196F3" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrdersChart;