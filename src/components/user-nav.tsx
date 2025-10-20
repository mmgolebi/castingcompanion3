'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Settings, LogOut } from 'lucide-react';

interface UserNavProps {
  userName: string;
  userEmail: string;
  signOutAction: () => void;
}

export function UserNav({ userName, userEmail, signOutAction }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white font-semibold flex items-center justify-center hover:opacity-90 transition-opacity"
      >
        {getInitials(userName || userEmail)}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-1 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-semibold text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              onClick={() => {
                setIsOpen(false);
                signOutAction();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
