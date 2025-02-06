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