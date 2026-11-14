import React, { useState } from 'react';

function Newsletter() {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState({ message: '', isError: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ message: '', isError: false });

    // Client-side validation
    if (!email.trim()) {
      setFeedback({ message: 'Please enter a valid email address.', isError: true });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFeedback({ message: data.message, isError: false });
        setEmail('');
      } else {
        setFeedback({ message: data.message || 'Subscription failed.', isError: true });
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setFeedback({
        message: 'Could not connect to the backend server. Make sure it is running.',
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 p-6 flex flex-col items-center justify-center border-t border-b">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center justify-center gap-4">
        <label htmlFor="newsletter-email" className="font-semibold text-gray-800 tracking-wider">
          SIGN UP FOR OUR DAILY INSIDER
        </label>
        <input
          id="newsletter-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gray-400 hover:bg-gray-500 text-white font-medium px-6 py-2 rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>

      {/* Outcome alert message */}
      {feedback.message && (
        <div
          className={`mt-4 px-4 py-2 rounded text-sm font-medium ${feedback.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}

export default Newsletter;