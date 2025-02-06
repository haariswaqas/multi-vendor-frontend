// components/ui/alert-dialog.js
import React from 'react';

export function AlertDialog({ open, onOpenChange, children }) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      {children}
    </div>
  );
}

export function AlertDialogContent({ className, children, ...props }) {
  return (
    <div
      className={`relative rounded-lg max-w-lg w-full mx-4 p-6 shadow-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertDialogHeader({ className, ...props }) {
  return (
    <div
      className={`flex flex-col space-y-2 mb-4 ${className}`}
      {...props}
    />
  );
}

export function AlertDialogFooter({ className, ...props }) {
  return (
    <div
      className={`flex justify-end space-x-2 mt-6 ${className}`}
      {...props}
    />
  );
}

export function AlertDialogTitle({ className, ...props }) {
  return (
    <h2
      className={`text-lg font-semibold ${className}`}
      {...props}
    />
  );
}

export function AlertDialogDescription({ className, ...props }) {
  return (
    <div
      className={`text-sm ${className}`}
      {...props}
    />
  );
}

export function AlertDialogAction({ className, ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-md text-sm font-medium ${className}`}
      {...props}
    />
  );
}

export function AlertDialogCancel({ className, ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-md text-sm font-medium ${className}`}
      {...props}
    />
  );
}