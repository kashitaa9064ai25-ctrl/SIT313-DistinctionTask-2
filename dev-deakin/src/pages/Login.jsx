import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Authenticate using Firebase Auth (verifies email & password)
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();

      // Fetch user's plan and display name from Firestore
      let displayName = user.displayName || 'N Kashitaa';
      let plan = 'Free';

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          displayName = data.displayName || displayName;
          plan = data.plan || 'Free';
        }
      } catch (docErr) {
        console.warn('Could not read Firestore document:', docErr);
      }

      // Save session in AuthContext & localStorage
      await login(
        {
          uid: user.uid,
          email: user.email,
          displayName: displayName,
        },
        token,
        plan
      );

      // Redirect to home
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        setError('Incorrect email or password. Please try again.');
      } else {
        setError(err.message || 'An error occurred while logging in.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-280px)] p-6 bg-gray-50">
      <div className="relative w-full max-w-sm p-6 bg-white border border-gray-300 rounded shadow-sm">
        <Link
          to="/signup"
          className="absolute top-4 right-4 text-xs text-blue-600 border border-blue-400 px-2 py-0.5 rounded hover:bg-blue-50"
        >
          Sign up
        </Link>
        <h2 className="mb-6 text-xl font-semibold text-gray-800">Login</h2>

        {error && (
          <div className="p-2 mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Your email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Your password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}