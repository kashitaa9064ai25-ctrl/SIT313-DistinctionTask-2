import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { currentUser, userPlan, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-gray-200 border-b border-gray-300 py-2.5 px-6 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Nav Links */}
        <div className="flex items-center space-x-5">
          <Link to="/" className="font-bold text-xl text-gray-800 tracking-tight hover:text-black shrink-0">
            DEV@Deakin
          </Link>

          <nav className="flex items-center space-x-3 text-sm font-medium text-gray-700">
            <Link to="/" className="hover:text-black transition">
              Home
            </Link>
            <Link to="/about" className="hover:text-black transition">
              About
            </Link>
            <Link to="/browse" className="hover:text-black transition font-semibold text-blue-700">
              Browse Posts
            </Link>
            <Link to="/pricing" className="hover:text-black transition">
              Pricing
            </Link>
          </nav>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xs mx-2">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-3 py-1 text-sm bg-white border border-gray-400 rounded focus:outline-none"
          />
        </div>

        {/* Post & Auth Controls */}
        <div className="flex items-center space-x-3 text-sm font-medium text-gray-700 shrink-0">
          <Link to="/post" className="hover:text-black transition cursor-pointer">
            Post
          </Link>

          {currentUser ? (
            <div className="flex items-center space-x-2">
              <span
                className={`text-[11px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider border ${userPlan === 'Paid'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-gray-100 text-gray-600 border-gray-300'
                  }`}
              >
                {userPlan} Plan
              </span>

              <span className="text-gray-800 font-semibold text-xs max-w-[100px] truncate">
                {currentUser.displayName || currentUser.email}
              </span>

              <button
                onClick={handleLogout}
                className="bg-white border border-gray-400 px-2.5 py-1 text-xs rounded hover:bg-red-50 hover:text-red-600 hover:border-red-400 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-white border border-gray-400 px-3 py-1 rounded hover:bg-gray-100 hover:text-black transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;