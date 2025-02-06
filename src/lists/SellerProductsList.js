import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../authentication/AuthContext";
import { PackageOpen, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/profile-detail-card';
import { Badge } from '../components/ui/profile-badge';

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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin">
        <Loader2 className="w-16 h-16 text-indigo-500" />
      </div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="bg-red-50">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
          <p className="text-xl text-red-700 text-center">{error}</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold text-indigo-600 flex items-center justify-center gap-4">
            <PackageOpen className="w-12 h-12" />
            Your Products
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product._id} className="hover:shadow-lg transition-shadow duration-300">
                  <div className="relative">
                    <img
                      src={product.img}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge 
                      variant={product.available ? "default" : "destructive"} 
                      className="absolute top-4 right-4"
                    >
                      {product.available ? "Available" : "Out of Stock"}
                    </Badge>
                  </div>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                      <p className="text-gray-600 line-clamp-2">{product.desc}</p>
                    </div>
                    
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
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <PackageOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No products found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold text-indigo-600 flex items-center justify-center gap-4">
            <PackageOpen className="w-12 h-12" />
            Your Sales
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {sales.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sales.map((sale) => (
                <Card key={sale._id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{sale.productName}</h3>
                      <p className="text-gray-600 line-clamp-2">{sale.description}</p>
                    </div>
                    
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
                      Order #{sale._id.slice(-6)}
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
  );
};

export default SellerProductsList;