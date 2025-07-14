"use client";

import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  type = "button",
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
}) => {
  const base =
    "w-full py-2 rounded transition text-white font-medium focus:outline-none";

  const variants = {
    primary: "bg-accent hover:bg-accent/80",
    secondary: "bg-secondary hover:bg-secondary/80",
    ghost: "bg-transparent text-accent border border-accent hover:bg-accent/10",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {children}
    </button>
  );
};
