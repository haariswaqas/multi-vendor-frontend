import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../authentication/AuthContext';
import { updateOrderStatus } from '../services/OrderServices';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

const EditOrderStatus = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!status) return;
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await updateOrderStatus(orderId, authState.token, status);
      setSuccess(true);
      setTimeout(() => navigate('/sales'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Edit Order Status</h1>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-100 text-green-800">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Order status updated successfully!</AlertDescription>
        </Alert>
      )}
      <form
        onSubmit={handleUpdate}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">New Status</label>
          <input
            type="text"
            value={status}
            onChange={handleStatusChange}
            placeholder="Enter new status (e.g., received)"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-200"
        >
          {loading ? 'Updating...' : 'Update Order Status'}
        </button>
      </form>
    </div>
  );
};

export default EditOrderStatus;
