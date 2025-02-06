const ORDER_URL = 'http://localhost:8003/';

// Fetch all orders
export const fetchOrders = async (token) => {
  console.log("Token in fetchOrders:", token); // Debugging
  try {
    const response = await fetch(`${ORDER_URL}orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

  
    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Unexpected API response format');
    }

    return data; // Since API returns an array, return it directly
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch orders');
  }
};
export const fetchSellerSales = async (token) => {
  
    try {
      const response = await fetch(`${ORDER_URL}seller-sales `, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch sales');
      }
  
      const data = await response.json();
  
      if (!Array.isArray(data)) {
        throw new Error('Unexpected API response format');
      }
  
      return data; // Since API returns an array, return it directly
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch orders');
    }
  };


// Update order status (for sellers)
// Expects orderId (the identifier in the URL), token, and new status (e.g., "received")
export const updateOrderStatus = async (orderId, token, status) => {
    try {
      const response = await fetch(`${ORDER_URL}sales/${orderId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update order status: ${response.statusText}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update order status');
    }
  };
