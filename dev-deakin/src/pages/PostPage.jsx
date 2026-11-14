import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PostPage() {
  const { currentUser, userPlan } = useAuth();
  const navigate = useNavigate();

  const [postType, setPostType] = useState('Article');
  const [postPlan, setPostPlan] = useState('Free');
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Enforce user login
    if (!currentUser) {
      setError('You must be logged in to create a post.');
      return;
    }

    // Prevent Free users from submitting Paid posts
    if (postPlan === 'Paid' && userPlan !== 'Paid') {
      setError('Only Paid tier subscribers can create Paid posts. Please upgrade your plan.');
      return;
    }

    // Validate input fields
    if (!title.trim()) {
      setError('Please provide a descriptive title.');
      return;
    }
    if (!text.trim()) {
      setError(
        postType === 'Article'
          ? 'Please provide the article text.'
          : 'Please describe your problem.'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          authorName: currentUser.displayName || currentUser.email,
          postType,
          plan: postPlan,
          title: title.trim(),
          abstract: abstract.trim(),
          text: text.trim(),
          image: imageUrl.trim() || undefined,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Post submitted successfully!');
        setTitle('');
        setAbstract('');
        setText('');
        setImageUrl('');
        setTags('');
        setTimeout(() => navigate('/browse'), 1200);
      } else {
        setError(data.message || 'Failed to submit post.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to backend server. Make sure port 5000 is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6">New Post</h2>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2.5 rounded text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-100 border border-green-300 text-green-700 px-4 py-2.5 rounded text-sm font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Type Selector */}
          <div className="flex items-center space-x-6 text-sm font-medium text-gray-700">
            <span className="w-36 font-semibold">Select Post Type:</span>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="postType"
                value="Question"
                checked={postType === 'Question'}
                onChange={() => setPostType('Question')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Question</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="postType"
                value="Article"
                checked={postType === 'Article'}
                onChange={() => setPostType('Article')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Article</span>
            </label>
          </div>

          {/* Select Post Plan */}
          <div className="flex items-center space-x-6 text-sm font-medium text-gray-700 p-2.5 bg-gray-50 border border-gray-200 rounded">
            <span className="w-36 font-semibold text-gray-800">Select Post Plan:</span>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="postPlan"
                value="Free"
                checked={postPlan === 'Free'}
                onChange={() => setPostPlan('Free')}
                className="text-teal-600 focus:ring-teal-500"
              />
              <span>Free</span>
            </label>

            {userPlan === 'Paid' ? (
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="postPlan"
                  value="Paid"
                  checked={postPlan === 'Paid'}
                  onChange={() => setPostPlan('Paid')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span className="font-semibold text-amber-700">Paid (Exclusive)</span>
              </label>
            ) : (
              <div className="flex items-center space-x-2 text-gray-400 cursor-not-allowed">
                <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded">
                  🔒 Paid (Subscribers Only)
                </span>
                <Link
                  to="/pricing"
                  className="text-xs text-amber-600 hover:underline font-semibold"
                >
                  Upgrade to unlock
                </Link>
              </div>
            )}
          </div>

          {/* Content Inputs */}
          <div className="pt-2">
            <h3 className="font-semibold text-sm text-gray-800 mb-2">
              What do you want to ask or share
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              This section is designed based on the type of the post ({postType}).
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
              <input
                type="text"
                placeholder="Enter a descriptive title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {postType === 'Article' && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Abstract</label>
                <textarea
                  rows={2}
                  placeholder="Enter a 1-paragraph abstract"
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {postType === 'Article' && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... (optional)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {postType === 'Article' ? 'Article Text' : 'Describe your problem'}
              </label>
              <textarea
                rows={6}
                placeholder={
                  postType === 'Article'
                    ? 'Enter article content...'
                    : 'Describe what you are trying to solve...'
                }
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                placeholder="Please add up to 3 tags separated by commas e.g., Java, React"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-gray-800 hover:bg-black text-white font-semibold px-6 py-2 rounded text-sm transition disabled:opacity-50"
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}