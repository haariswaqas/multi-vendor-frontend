import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../authentication/AuthContext";
import { PackageOpen, AlertTriangle, Loader2, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/profile-detail-card";
import { Badge } from "../components/ui/profile-badge";
import { Link } from "react-router-dom";

const SellerProductsList = () => {
  const { authState } = useAuth();
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!authState.isAuthenticated || !authState.token) {
        setError("Unauthorized. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:8002/products/seller", {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });
        setProducts(response.data);

        const salesResponse = await axios.get("http://localhost:8003/seller-sales", {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });
        setSales(salesResponse.data);
      } catch (err) {
        setError("Failed to fetch products or sales. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [authState]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin">
          <Loader2 className="w-16 h-16 text-indigo-500" />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="container mx-auto px-4 py-8 max-w-screen-md">
        <Card className="bg-red-50">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-xl text-red-700 text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="container mx-auto max-w-screen-xl space-y-12">
        {/* Seller's Products Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-4xl font-bold text-indigo-600 flex items-center justify-center gap-4">
              <PackageOpen className="w-14 h-14" />
              Your Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => {
                  // Ensure the product image is an array; if not, wrap it in an array with a placeholder.
                  const images = Array.isArray(product.img)
                    ? product.img
                    : [product.img || "/api/placeholder/400/400"];

                  return (
                    <Link
                      to={`/product/${product._id}`}
                      key={product._id}
                      className="block hover:shadow-xl transition-shadow duration-300"
                    >
                      <Card className="flex flex-col h-full">
                        <div className="relative">
                          <img
                            src={images[0]}
                            alt={product.name}
                            className="w-full h-56 object-cover rounded-t-lg"
                          />
                          <Badge
                            variant={product.available ? "default" : "destructive"}
                            className="absolute top-4 right-4"
                          >
                            {product.available ? "Available" : "Out of Stock"}
                          </Badge>
                        </div>
                        <CardContent className="p-4 flex-grow">
                          <h3 className="text-2xl font-semibold mb-2">{product.name}</h3>
                          <p className="text-gray-600 line-clamp-2 mb-4">{product.desc}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Type</span>
                              <span className="font-medium">{product.type}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Stock</span>
                              <span className="font-medium">{product.stock}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Price</span>
                              <span className="font-medium">${product.price}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <PackageOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No products found.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seller's Sales Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-4xl font-bold text-indigo-600 flex items-center justify-center gap-4">
              <PackageOpen className="w-14 h-14" />
              Your Sales
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <Link
              to="/sales"
              className="text-center text-indigo-600 hover:underline flex items-center justify-center gap-2 text-lg"
            >
              View More <ArrowRight className="w-5 h-5" />
            </Link>
          </CardFooter>
          <CardContent>
            {sales.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {sales.map((sale) => (
                  <Card key={sale._id} className="hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-4 space-y-4">
                      <h3 className="text-2xl font-semibold mb-2">{sale.productName}</h3>
                      <p className="text-gray-600 line-clamp-2">{sale.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Date</span>
                          <span className="font-medium">{sale.date}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Amount</span>
                          <span className="font-medium">${sale.amount}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="w-full justify-center">
                        Order #{sale.orderId}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <PackageOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No sales found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerProductsList;
