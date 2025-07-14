"use client";

import React from "react";

interface InputFieldProps {
  type?: string;
  name?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  className?: string; // optional for additional customization
}

export const InputField: React.FC<InputFieldProps> = ({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  className = "",
}) => {
  return (
    <div className="mb-4">
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className={`w-full p-2 border border-gray-300 rounded bg-input focus:outline-none focus:ring-2 focus:ring-accent ${error ? "border-error" : ""} ${className}`}
        value={value}
        onChange={onChange}
        required={required}
      />
      {error && <p className="text-error text-sm mt-1">{error}</p>}
    </div>
  );
};
