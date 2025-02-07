// components/ui/alert.js
import React from 'react';

export function Alert({ className, variant = "default", ...props }) {
  const baseStyles = "relative w-full rounded-lg border p-4";
  const variantStyles = {
    default: "bg-gray-800/50 text-gray-200 border-gray-700",
    destructive: "border-red-500/50 text-red-300 bg-red-500/10"
  };
  
  return (
    <div
      role="alert"
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }) {
  return (
    <h5
      className={`mb-1 font-medium leading-none tracking-tight ${className}`}
      {...props}
    />
  );
}

export function AlertDescription({ className, ...props }) {
  return (
    <div
      className={`text-sm opacity-90 ${className}`}
      {...props}
    />
  );
}

export function AlertTriangle({ className, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.29 3.86L1.82 18a1.5 1.5 0 001.29 2.25h18.78a1.5 1.5 0 001.29-2.25L13.71 3.86a1.5 1.5 0 00-2.42 0zM12 9v4m0 4h.01"
      />
    </svg>
  );
}
