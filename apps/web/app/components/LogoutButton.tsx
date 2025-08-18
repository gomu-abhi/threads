"use client"; 

import React from 'react';
import { api } from "../../lib/axios";
import { useRouter } from 'next/navigation';

const LogoutButton: React.FC = () => {
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    try {
      if (!confirm("Are you sure you want to logout?")) return;
      const response = await api.get('/auth/logout');
      router.push('/login');
    } catch (error) {
      let errorMessage = 'An unknown error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('An error occurred during logout:', errorMessage);
      alert('An error occurred. Please check your connection and try again.');
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault();
    handleLogout();
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
    >
      Logout
    </a>
  );
};

export default LogoutButton;