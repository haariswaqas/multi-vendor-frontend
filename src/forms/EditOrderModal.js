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

const EditOrderModal = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  // Use local state to control the modal visibility.
  const [open, setOpen] = useState(true);

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

      // After a brief delay, close the modal and navigate away.
      setTimeout(() => {
        setOpen(false);
        navigate('/sales');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle closing the modal (e.g. when the user cancels).
  const handleClose = () => {
    setOpen(false);
    navigate('/sales');
  };

  return (
    <AlertDialog
      open={open}
      // When the modal is closed (e.g. via an outside click), navigate away.
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
        setOpen(isOpen);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Order Status</AlertDialogTitle>
          <AlertDialogDescription>
            Select a new status for the order.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Display error or success messages inside the modal */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="bg-green-100 text-green-800 mb-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Order status updated successfully!</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleUpdate}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              New Status
            </label>
            <select
              value={status}
              onChange={handleStatusChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Select Status</option>
              <option value="received">Received</option>
              <option value="on the way">On the Way</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleClose}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Order Status'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditOrderModal;
