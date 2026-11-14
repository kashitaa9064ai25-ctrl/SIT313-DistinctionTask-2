import React, { useState } from 'react';
import HeroBanner from '../components/HeroBanner';
import AboutSection from '../components/AboutSection';
import CardList from '../components/CardList';
import { articles as initialArticles } from '../data/articles';
import { tutorials as initialTutorials } from '../data/tutorials';
import { useAuth } from '../context/AuthContext';

// Helper to assign distinct tech photos to posts
const getUniquePostImage = (id, title, index) => {
  const techImages = [
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=600&q=80',
  ];

  const seedString = id || title || String(index);
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
  }
  const imgIndex = Math.abs(hash) % techImages.length;
  return techImages[imgIndex];
};

export default function Home() {
  const { userPlan } = useAuth();

  const [articlesList, setArticlesList] = useState(initialArticles);
  const [isArticlesExpanded, setIsArticlesExpanded] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(false);

  const handleToggleSeeAllArticles = async () => {
    if (isArticlesExpanded) {
      setArticlesList(initialArticles);
      setIsArticlesExpanded(false);
      return;
    }

    setLoadingArticles(true);
    try {
      const response = await fetch(`http://localhost:5000/api/posts?userPlan=${userPlan}`);
      const data = await response.json();

      if (response.ok && data.success) {
        const backendPosts = data.posts || [];
        const backendArticles = backendPosts.filter((p) => p.postType === 'Article');

        const formattedArticles = backendArticles.map((item, idx) => ({
          id: item.id || idx,
          name: item.title,
          description: item.abstract || item.text,
          author: item.authorName || 'Dev Community',
          plan: item.plan || 'Free',
          rating: '5.0',
          image: item.image || getUniquePostImage(item.id, item.title, idx),
        }));

        setArticlesList(formattedArticles.length > 0 ? formattedArticles : initialArticles);
        setIsArticlesExpanded(true);
      }
    } catch (err) {
      console.error('Failed to fetch articles from backend:', err);
    } finally {
      setLoadingArticles(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <HeroBanner />
      <AboutSection />

      {/* Featured Articles */}
      <CardList
        id="articles"
        title="Featured Articles"
        items={articlesList}
        buttonText={
          loadingArticles
            ? 'Loading...'
            : isArticlesExpanded
              ? 'Show less'
              : 'See all articles'
        }
        onButtonClick={handleToggleSeeAllArticles}
      />

      {/* Featured Tutorials */}
      <CardList
        id="tutorials"
        title="Featured Tutorials"
        items={initialTutorials}
        buttonText="See all tutorials"
      />
    </div>
  );
}