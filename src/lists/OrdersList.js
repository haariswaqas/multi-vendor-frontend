import React, { useEffect, useState } from "react";
import { useAuth } from "../authentication/AuthContext";
import { fetchOrders } from "../services/OrderServices";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpDown } from "lucide-react";

const OrdersList = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [displayedOrders, setDisplayedOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeFrame, setTimeFrame] = useState('weekly');
  const [sortOrder, setSortOrder] = useState('default');

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
        setDisplayedOrders(fetchedOrders);
      } catch (err) {
        setError(err.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [authState.token]);

  // Sort orders when sortOrder changes
  useEffect(() => {
    const sortOrders = () => {
      const ordersCopy = [...orders];
      
      switch (sortOrder) {
        case 'amount-asc':
          ordersCopy.sort((a, b) => a.amount - b.amount);
          break;
        case 'amount-desc':
          ordersCopy.sort((a, b) => b.amount - a.amount);
          break;
        case 'date-desc':
          ordersCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'date-asc':
          ordersCopy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        default:
          // Keep default order (most recent first)
          ordersCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      setDisplayedOrders(ordersCopy);
    };

    sortOrders();
  }, [sortOrder, orders]);

  const groupOrdersData = (orders, timeFrame) => {
    const now = new Date();
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const diffTime = Math.abs(now - orderDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (timeFrame) {
        case 'daily':
          return diffDays <= 1;
        case 'weekly':
          return diffDays <= 7;
        case 'monthly':
          return diffDays <= 30;
        default:
          return true;
      }
    });

    return filteredOrders.reduce((acc, order) => {
      const date = new Date(order.createdAt);
      let key;

      if (timeFrame === "daily") {
        key = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (timeFrame === "weekly") {
        key = date.toLocaleDateString([], { weekday: 'short' });
      } else {
        key = date.toLocaleDateString([], { day: 'numeric', month: 'short' });
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

  const calculateTotalSpent = (orders, timeFrame) => {
    const filteredOrders = ordersData.reduce((sum, item) => sum + item.total, 0);
    return filteredOrders.toFixed(2);
  };

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

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-lg w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-gray-500 text-center">
              <p className="text-lg">No orders found</p>
              <p className="text-sm mt-2">Your order history will appear here once you make a purchase</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-600" />
              <select
                className="pl-3 pr-10 py-2 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="default">Sort by: Recent</option>
                <option value="amount-desc">Amount: High to Low</option>
                <option value="amount-asc">Amount: Low to High</option>
                <option value="date-desc">Date: Newest First</option>
                <option value="date-asc">Date: Oldest First</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              Showing {displayedOrders.length} order{displayedOrders.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Expenditure Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label htmlFor="timeFrame" className="block text-sm font-medium text-gray-700">
                  View expenditure for:
                </label>
                <select
                  id="timeFrame"
                  name="timeFrame"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={timeFrame}
                  onChange={(e) => setTimeFrame(e.target.value)}
                >
                  <option value="daily">Today</option>
                  <option value="weekly">This Week</option>
                  <option value="monthly">This Month</option>
                </select>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-4">
                ${calculateTotalSpent(orders, timeFrame)}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  total spent
                </span>
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
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Amount']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar dataKey="total" fill="#2196F3" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
          {displayedOrders.map((order, index) => (
            <Card key={order._id} className="overflow-hidden">
              {/* Rest of the order card content remains the same */}
              <CardHeader className="bg-gray-50 py-3 px-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Order #{displayedOrders.length - index}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${order.amount.toFixed(2)}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                        order.status.toLowerCase() === "received"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
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
                  {order.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={item.product.img[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h3 className="font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>${item.product.price.toFixed(2)} × {item.amount}</span>
                            <span className="font-medium text-gray-900">
                              ${(item.product.price * item.amount).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {item.product.desc}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.product.type && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-800">
                              {item.product.type}
                            </span>
                          )}
                          {item.product.sizes && item.product.sizes.length > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-800">
                              Size: {item.product.sizes.join(", ")}
                            </span>
                          )}
                          {item.product.colors && item.product.colors.length > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-800">
                              Color: {item.product.colors.join(", ")}
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                            item.product.available 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {item.product.available ? "In Stock" : "Out of Stock"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersList;