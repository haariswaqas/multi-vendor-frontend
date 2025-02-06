import React, { useEffect, useState } from "react";
import { useAuth } from "../authentication/AuthContext";
import { fetchOrders } from "../services/OrderServices";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../components/ui/card";

const OrdersList = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <div className="text-sm text-gray-500">
            Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="grid gap-4">
          {orders.map((order) => {
            const orderDate = new Date(order.createdAt).toLocaleString();
            return (
              <Card key={order._id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 py-3 px-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Order #{order.orderId}</p>
                      <p className="text-xs text-gray-400">{orderDate}</p>
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
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrdersList;