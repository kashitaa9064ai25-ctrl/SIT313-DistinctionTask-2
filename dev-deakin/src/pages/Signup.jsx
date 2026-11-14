import React, { useState } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import bcrypt from 'bcryptjs';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Password strength checker helper
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const getStrengthLabel = () => {
    if (!formData.password) return '';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 4) return 'Moderate';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 4) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const { name, email, password, confirmPassword } = formData;

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    // Strong password validation regex:
    // Minimum 8 chars, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/])[A-Za-z\d@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/]{8,}$/;

    if (!strongPasswordRegex.test(password)) {
      setError(
        'Password must be at least 8 characters long and contain uppercase, lowercase, a number, and a special character.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.trim().toLowerCase()));
      const snap = await getDocs(q);

      if (!snap.empty) {
        setError('An account with this email address already exists.');
        setLoading(false);
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await addDoc(usersRef, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      });

      // Show top popup notification
      setSuccessMsg('Account created successfully! Redirecting to login...');

      // Redirect after a short delay so user can read the banner
      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (err) {
      console.error(err);
      setError('Registration failed: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-140px)] px-4 py-12 bg-slate-50">
      {/* Top Floating Success Banner / Toast */}
      {successMsg && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-xl shadow-emerald-900/20 border border-emerald-400 transition-all duration-300 animate-bounce">
          <svg
            className="w-5 h-5 text-emerald-100 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      <div className="w-full max-w-md p-8 bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Create an Account
          </h2>

        </div>

        {/* Error Notification */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-5 text-xs text-red-700 bg-red-50 border border-red-200/80 rounded-xl">
            <svg
              className="w-4 h-4 flex-shrink-0 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Kashitaa"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white border border-slate-300 rounded-xl transition duration-150 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@gmail.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white border border-slate-300 rounded-xl transition duration-150 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white border border-slate-300 rounded-xl transition duration-150 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none"
              required
            />

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500">
                  <span>Strength</span>
                  <span
                    className={
                      passwordStrength <= 2
                        ? 'text-red-600 font-bold'
                        : passwordStrength <= 4
                          ? 'text-amber-600 font-bold'
                          : 'text-emerald-600 font-bold'
                    }
                  >
                    {getStrengthLabel()}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Repeat password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white border border-slate-300 rounded-xl transition duration-150 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 text-sm font-semibold text-white bg-blue-600 rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.99] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}