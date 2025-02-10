import React, { useEffect, useState } from "react";
import { useAuth } from "../authentication/AuthContext";
import { useNavigate } from "react-router-dom";
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

const MySalesList = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("monthly");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const loadSales = async () => {
      if (!authState.token) {
        setError("User is not authenticated");
        return;
      }
      setLoading(true);
      try {
        const fetchedSales = await fetchSellerSales(authState.token);
        const sortedSales = fetchedSales.sort(
          (a, b) => (sortOrder === "desc" ? b.amount - a.amount : a.amount - b.amount)
        );
        setSales(sortedSales);
      } catch (err) {
        setError(err.message || "Failed to fetch sales");
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, [authState.token, sortOrder]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-600 flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-75"></div>
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-150"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-lg w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-red-500 flex items-center gap-2 justify-center">
              <span className="text-lg">Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sales || sales.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-lg w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-gray-500 text-center">
              <p className="text-lg">No sales found</p>
              <p className="text-sm mt-2">Your sales will appear here once you make your first sale</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group sales data based on the selected filter
  const groupSalesData = (sales, filter) => {
    return sales.reduce((acc, sale) => {
      const date = new Date(sale.createdAt);
      let key;

      if (filter === "daily") {
        key = date.toLocaleDateString();
      } else if (filter === "weekly") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDay());
        key = weekStart.toLocaleDateString();
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

  // Calculate the distribution of order statuses for the PieChart
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
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Sales</h1>
          <div className="text-sm text-gray-500">
            Showing {sales.length} order{sales.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-gray-700 mr-2">View by:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="text-gray-700 mr-2">Sort by:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            <option value="desc">Highest to Lowest</option>
            <option value="asc">Lowest to Highest</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {filter.charAt(0).toUpperCase() + filter.slice(1)} Revenue
              </CardTitle>
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
                  <Pie
                    data={statusDistribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
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

        <div className="grid gap-4">
          {sales.map((order, index) => {
            const orderDate = new Date(order.createdAt).toLocaleString();
            const items = order.products || order.items || []; // Handle both data structures
            
            return (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-gray-50 py-3 px-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">
                        Sale #{index + 1} 
                      </p>
                      <p className="text-xs text-gray-400">{orderDate}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${order.amount.toFixed(2)}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                            order.status.toLowerCase() === "received"
                              ? "bg-green-100 text-green-800"
                              : order.status.toLowerCase() === "on the way"
                              ? "bg-blue-100 text-blue-800"
                              : order.status.toLowerCase() === "delivered"
                              ? "bg-gray-100 text-gray-800"
                              : order.status.toLowerCase() === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      {authState.user?.role !== "Buyer" && (
                        <button
                          onClick={() => navigate(`/edit-order/${order.orderId}`)}
                          className="bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <div className="grid gap-3">
                    {items.map((item) => {
                      // Handle both data structures
                      const product = item.product || item;
                      const quantity = item.amount || item.quantity || 1;
                      const image = product.img?.[0] || product.image;
                      
                      return (
                        <div
                          key={product._id}
                          className="flex gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="w-20 h-20 flex-shrink-0">
                            <img
                              src={image}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <h3 className="font-medium text-gray-900 truncate">
                                {product.name}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span>
                                  ${product.price.toFixed(2)} × {quantity}
                                </span>
                                <span className="font-medium text-gray-900">
                                  ${(product.price * quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {product.desc}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {product.type && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-800">
                                  {product.type}
                                </span>
                              )}
                              {product.sizes && product.sizes.length > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-800">
                                  Size: {product.sizes.join(", ")}
                                </span>
                              )}
                              {product.colors && product.colors.length > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-800">
                                  Color: {product.colors.join(", ")}
                                </span>
                              )}
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-800">
                                Stock: {product.stock || (product.available ? "In Stock" : "Out of Stock")}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MySalesList;