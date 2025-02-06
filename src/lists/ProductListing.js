import React, { useEffect, useState } from "react";
import { useAuth } from "../authentication/AuthContext"; // Adjust path as needed
import { manageCart } from "../services/ProductServices"; // Your API call function

const ProductListing = () => {
  const { authState } = useAuth();

  // Initialize cartItems from localStorage.
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem("cartItems");
    return storedCart ? JSON.parse(storedCart) : [];
  });
  
  const [products, setProducts] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Persist cartItems to localStorage whenever they change.
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Load products and (optionally) synchronize cart state from API.
  useEffect(() => {
    const loadInitialData = async () => {
      if (!authState.isAuthenticated) {
        setError("Please login to view products");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await Promise.all([fetchProducts(), fetchCartItems()]);
      } catch (err) {
        setError(err.message || "Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [authState.isAuthenticated, authState.token]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:8002/");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else {
        throw new Error("Invalid product data received");
      }
    } catch (err) {
      throw new Error(`Failed to fetch products: ${err.message}`);
    }
  };

  const fetchCartItems = async () => {
    if (!authState.token) {
      throw new Error("Authentication required");
    }

    try {
      const response = await fetch("http://localhost:8003/cart", {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please login again.");
        }
        throw new Error("Failed to fetch cart items");
      }

      const data = await response.json();
      // Adjust based on your API's returned shape.
      const items = Array.isArray(data) ? data : data.products || [];
      // For each item coming from the API, we assume it is in the cart so we set isRemove: false.
      setCartItems(items.map(item => ({ ...item, isRemove: false })));
    } catch (err) {
      throw new Error(`Failed to fetch cart items: ${err.message}`);
    }
  };

  const handleSelectionChange = (productId, field, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleQuantityChange = (productId, value) => {
    setQuantity((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  // Add product to the cart.
  const handleAddToCart = async (product) => {
    try {
      if (!authState.isAuthenticated) {
        setError("Please login to manage cart");
        return;
      }

      const selectedSize = selectedOptions[product._id]?.size;
      const selectedColor = selectedOptions[product._id]?.color;
      if (!selectedSize || !selectedColor) {
        setError("Please select both size and color before adding to cart.");
        return;
      }

      const productQuantity = quantity[product._id] || 1;

      // Call API to add the product (isRemove = false means add).
      await manageCart(
        product._id,
        productQuantity,
        authState.token,
        [selectedSize],
        [selectedColor],
        false // false: we're not removing, we're adding
      );

      // Update local cart state: add product with isRemove false.
      setCartItems((prevItems) => [
        ...prevItems,
        { product, amount: productQuantity, isRemove: false },
      ]);
      setError(null);
    } catch (err) {
      setError(err.message || "An error occurred while adding the product.");
    }
  };

  // Remove product from the cart.
  const handleRemoveFromCart = async (product) => {
    try {
      if (!authState.isAuthenticated) {
        setError("Please login to manage cart");
        return;
      }

      // Call API to remove the product (isRemove = true means removal action).
      await manageCart(
        product.id,
        0, // quantity 0 for removal
        authState.token,
        [],
        [],
        true // true: removal
      );

      // Update local cart state by removing the product.
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.product._id !== product._id)
      );
      setError(null);
    } catch (err) {
      setError(err.message || "An error occurred while removing the product.");
    }
  };

  if (isLoading) {
    return <p>Loading products...</p>;
  }

  if (!authState.isAuthenticated) {
    return <p>Please login to view products</p>;
  }

  return (
    <div>
      <h1>Product Listing</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {products.map((product) => {
          // Determine the current toggle state using the isRemove property.
          // If an entry exists in cartItems, use its isRemove value;
          // otherwise, assume isRemove is true (i.e. product not in cart → Add is active).
          const cartEntry = cartItems.find(
            (item) => item.product && item.product._id === product._id
          );
          const isRemove = cartEntry ? cartEntry.isRemove : true;
          // According to the requirement:
          // If isRemove is false, the Remove button should be active.
          // If isRemove is true, the Add button should be active.

          return (
            <div
              key={product._id}
              style={{
                border: "1px solid #ddd",
                padding: "20px",
                width: "300px",
                textAlign: "center",
              }}
            >
              <img
                src={product.img}
                alt={product.name || "Product Image"}
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
              />
              <h3>{product.name}</h3>
              <p>{product.desc}</p>
              <p>Price: ${product.price}</p>
              <p>Stock: {product.stock}</p>

              <div>
                <label>Size: </label>
                <select
                  value={selectedOptions[product._id]?.size || ""}
                  onChange={(e) =>
                    handleSelectionChange(product._id, "size", e.target.value)
                  }
                  disabled={!isRemove} // Disable when product is in cart (isRemove false)
                >
                  <option value="">Select size</option>
                  {product.sizes?.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Color: </label>
                <select
                  value={selectedOptions[product._id]?.color || ""}
                  onChange={(e) =>
                    handleSelectionChange(product._id, "color", e.target.value)
                  }
                  disabled={!isRemove} // Disable when product is in cart
                >
                  <option value="">Select color</option>
                  {product.colors?.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Quantity: </label>
                <input
                  type="number"
                  value={quantity[product._id] || 1}
                  min="1"
                  onChange={(e) =>
                    handleQuantityChange(
                      product._id,
                      parseInt(e.target.value, 10)
                    )
                  }
                  disabled={!isRemove} // Optionally disable when in cart
                />
              </div>

              <div style={{ marginTop: "10px" }}>
                {/* When isRemove is true, Add is active; when false, Remove is active */}
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={!isRemove} // Enabled only when isRemove is true (not in cart)
                  style={{ marginRight: "10px" }}
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => handleRemoveFromCart(product)}
                  disabled={isRemove} // Enabled only when isRemove is false (in cart)
                >
                  Remove from Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductListing;
