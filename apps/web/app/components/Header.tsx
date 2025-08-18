"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from './LogoutButton';

const UserIcon = () => (
    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

export default function Header({ currentUserId }: { currentUserId: string }) {
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const pathname = usePathname(); 

  const getNavLinkClasses = (path: string) => 
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      pathname === path 
        ? 'bg-blue-100 text-blue-700' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' 
    }`;

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-2 flex justify-between items-center">
        <Link href="/feed" className="text-xl font-bold text-blue-600">
          threads
        </Link>

        <nav className="flex items-center space-x-2 md:space-x-4">
          <Link href="/feed" className={getNavLinkClasses('/feed')}>
            Home
          </Link>
          <Link href="/search" className={getNavLinkClasses('/search')}>
            Search
          </Link>
        </nav>

        <div className="relative">
          <button 
            onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Open user menu"
          >
            <UserIcon />
          </button>
          
          {isProfileMenuOpen && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg py-1"
              onClick={() => setProfileMenuOpen(false)} 
            >
              <Link href={`/profile/${currentUserId}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                My Profile
              </Link>
              <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Settings
              </a>
              <div className="border-t my-1"></div>
              <LogoutButton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}