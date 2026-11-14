import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function BrowsePosts() {
    const { userPlan } = useAuth(); // 'Free' or 'Paid'

    const [allPosts, setAllPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filtering states
    const [selectedType, setSelectedType] = useState('All');
    const [selectedPlan, setSelectedPlan] = useState('All');
    const [tagFilter, setTagFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [hiddenPostIds, setHiddenPostIds] = useState([]);
    const [expandedPost, setExpandedPost] = useState(null);

    // Fetch posts from backend with current userPlan
    const fetchPosts = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`http://localhost:5000/api/posts?userPlan=${userPlan}`);
            const data = await response.json();
            if (response.ok && data.success) {
                setAllPosts(data.posts || []);
            } else {
                setError(data.message || 'Failed to load posts from server.');
            }
        } catch (err) {
            console.error(err);
            setError('Could not connect to backend server on port 5000.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [userPlan]);

    // Hide action (client-side only, does not delete from Firestore)
    const handleHide = (id, e) => {
        e.stopPropagation();
        setHiddenPostIds((prev) => [...prev, id]);
    };

    // Reset all filters and unhide posts
    const handleReset = () => {
        setSelectedType('All');
        setSelectedPlan('All');
        setTagFilter('');
        setSearchTerm('');
        setHiddenPostIds([]);
    };

    // Filter application
    const visiblePosts = allPosts.filter((post) => {
        if (hiddenPostIds.includes(post.id)) return false;

        if (selectedType !== 'All' && post.postType !== selectedType) return false;
        if (selectedPlan !== 'All' && post.plan !== selectedPlan) return false;

        if (tagFilter.trim()) {
            const hasTag = post.tags && post.tags.some((t) => t.toLowerCase().includes(tagFilter.toLowerCase()));
            if (!hasTag) return false;
        }

        if (searchTerm.trim()) {
            const matchesTitle = post.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesText = post.text.toLowerCase().includes(searchTerm.toLowerCase());
            if (!matchesTitle && !matchesText) return false;
        }

        return true;
    });

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            {/* Title & Tier Status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-200 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Browse Posts</h1>
                    <p className="text-sm text-gray-500">
                        Viewing content as a{' '}
                        <span className={`font-semibold ${userPlan === 'Paid' ? 'text-amber-600' : 'text-gray-700'}`}>
                            {userPlan} Tier
                        </span>{' '}
                        reader. {userPlan === 'Free' && 'Upgrade to Paid in Pricing to unlock exclusive posts!'}
                    </p>
                </div>
                {userPlan === 'Free' && (
                    <Link
                        to="/pricing"
                        className="self-start md:self-auto bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded shadow transition"
                    >
                        Unlock Paid Posts
                    </Link>
                )}
            </div>

            {/* Filter Toolbar */}
            <div className="my-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-wrap items-center gap-4 text-sm">
                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                    <input
                        type="text"
                        placeholder="Search title or text..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Post Type Filter */}
                <div>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="All">All Types</option>
                        <option value="Article">Articles Only</option>
                        <option value="Question">Questions Only</option>
                    </select>
                </div>

                {/* Post Plan Filter */}
                <div>
                    <select
                        value={selectedPlan}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="All">All Plans</option>
                        <option value="Free">Free Only</option>
                        <option value="Paid">Paid Only</option>
                    </select>
                </div>

                {/* Tag Filter */}
                <div>
                    <input
                        type="text"
                        placeholder="Filter by tag..."
                        value={tagFilter}
                        onChange={(e) => setTagFilter(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1.5 w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Reset Button */}
                <button
                    onClick={handleReset}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-1.5 rounded transition"
                >
                    Reset
                </button>
            </div>

            {/* States */}
            {loading && <p className="text-center py-12 text-gray-500 text-sm">Loading posts from backend...</p>}
            {error && <div className="p-4 bg-red-100 text-red-700 rounded text-sm mb-6">{error}</div>}

            {/* Grid of Post Cards */}
            {!loading && !error && (
                <>
                    {visiblePosts.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-500 text-sm">No posts found matching your criteria.</p>
                            <button onClick={handleReset} className="mt-3 text-blue-600 text-xs hover:underline">
                                Reset all filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {visiblePosts.map((post) => (
                                <div
                                    key={post.id}
                                    onClick={() => setExpandedPost(post)}
                                    className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between relative group"
                                >
                                    <div>
                                        {/* Header Badges */}
                                        <div className="flex items-center justify-between mb-2">
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${post.plan === 'Paid'
                                                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                                        : 'bg-teal-50 text-teal-700 border border-teal-200'
                                                    }`}
                                            >
                                                {post.plan} {post.postType}
                                            </span>

                                            {/* Hide button */}
                                            <button
                                                onClick={(e) => handleHide(post.id, e)}
                                                title="Hide post from view"
                                                className="text-gray-400 hover:text-red-500 text-xs font-semibold px-1 py-0.5"
                                            >
                                                ✕ Hide
                                            </button>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-base font-bold text-gray-800 mb-1.5 line-clamp-1 group-hover:text-blue-600">
                                            {post.title}
                                        </h3>

                                        {/* Abstract / Preview text */}
                                        <p className="text-xs text-gray-600 mb-3 line-clamp-3">
                                            {post.abstract || post.text}
                                        </p>
                                    </div>

                                    {/* Footer metadata */}
                                    <div className="border-t pt-3 mt-2 flex flex-col gap-2 text-[11px] text-gray-500">
                                        <div className="flex flex-wrap gap-1">
                                            {post.tags &&
                                                post.tags.map((tag, idx) => (
                                                    <span key={idx} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                                        #{tag}
                                                    </span>
                                                ))}
                                        </div>
                                        <div className="flex items-center justify-between pt-1">
                                            <span>By {post.authorName}</span>
                                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Expanded Modal View */}
            {expandedPost && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative max-h-[85vh] overflow-y-auto">
                        <button
                            onClick={() => setExpandedPost(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg font-bold"
                        >
                            ✕
                        </button>

                        <div className="flex items-center space-x-2 mb-3">
                            <span
                                className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${expandedPost.plan === 'Paid' ? 'bg-amber-100 text-amber-800' : 'bg-teal-50 text-teal-700'
                                    }`}
                            >
                                {expandedPost.plan} {expandedPost.postType}
                            </span>
                            <span className="text-xs text-gray-400">
                                • {new Date(expandedPost.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mb-2">{expandedPost.title}</h2>
                        <p className="text-xs text-gray-500 mb-4">Authored by {expandedPost.authorName}</p>

                        {expandedPost.abstract && (
                            <div className="bg-gray-50 border-l-4 border-blue-500 p-3 my-3 text-xs text-gray-700 italic">
                                {expandedPost.abstract}
                            </div>
                        )}

                        <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed my-4">
                            {expandedPost.text}
                        </div>

                        {expandedPost.tags && expandedPost.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-4 border-t border-gray-100">
                                {expandedPost.tags.map((tag, idx) => (
                                    <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}