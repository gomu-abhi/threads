"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "../../lib/axios";
import PostCard from "../components/PostCard";
import CreatePostForm from "../components/createPostForm";
import Header from "../components/Header";

type Tab = "trending" | "following";

interface Post {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  author: {
    id: string;
    name: string;
  };
  likes: {
    userId: string;
  }[];
  _count: {
    comments: number;
  };
}

interface FeedData {
  posts: Post[];
  hasMore: boolean;
  total: number;
  totalPages: number;
  page: number;
}

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<Tab>("following");
  const [feedData, setFeedData] = useState<Record<Tab, FeedData>>({
    trending: { posts: [], hasMore: true, total: 0, totalPages: 0, page: 0 },
    following: { posts: [], hasMore: true, total: 0, totalPages: 0, page: 0 }
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Record<Tab, number>>({
    trending: 0,
    following: 0
  });
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  const fetchUserData = async () => {
    try {
      const userRes = await api.get("/auth/me");
      setCurrentUserId(userRes.data.id);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load user data");
    }
  };

  const fetchPosts = async (tab: Tab, page: number = 1, reset: boolean = false, isRefresh: boolean = false) => {
    if (loading && !isRefresh) return;
    
    // Prevent duplicate requests
    if (isRefresh && refreshing) return;
    
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const endpoint = tab === "trending" ? "/posts/trending" : "/posts/following";
      const response = await api.get(`${endpoint}?page=${page}`);
      
      const { posts: newPosts, total, totalPages, page: currentPage } = response.data;
      const hasMore = currentPage < totalPages;

      setFeedData(prev => ({
        ...prev,
        [tab]: {
          posts: reset ? newPosts : [...prev[tab].posts, ...newPosts],
          hasMore,
          total,
          totalPages,
          page: currentPage
        }
      }));

      // Update last refresh time if this was a refresh
      if (reset) {
        setLastRefreshTime(prev => ({
          ...prev,
          [tab]: Date.now()
        }));
      }
    } catch (err: any) {
      console.error(`Error fetching ${tab} posts:`, err);
      setError(err.response?.data?.message || `Failed to load ${tab} posts`);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setInitialLoading(false);
    }
  };

  const loadMorePosts = useCallback(() => {
    const currentFeed = feedData[activeTab];
    if (currentFeed.hasMore && !loading && !refreshing) {
      fetchPosts(activeTab, currentFeed.page + 1, false, false);
    }
  }, [activeTab, feedData, loading, refreshing]);

  const handleTabChange = (tab: Tab) => {
    if (tab === activeTab) return; // Prevent unnecessary re-fetching if same tab
    
    setActiveTab(tab);
    setError("");
    
    const tabData = feedData[tab];
    const timeSinceLastRefresh = Date.now() - lastRefreshTime[tab];
    const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes
    
    // Fetch data if:
    // 1. Tab has never been loaded, OR
    // 2. Data is older than refresh threshold
    if ((tabData.posts.length === 0 && tabData.page === 0) || 
        timeSinceLastRefresh > REFRESH_THRESHOLD) {
      fetchPosts(tab, 1, true, true);
    }
  };

  const handleRefresh = () => {
    fetchPosts(activeTab, 1, true, true);
  };

  const handlePostCreated = () => {
    // Always refresh the following feed when a new post is created
    fetchPosts("following", 1, true, true);
    
    // If trending tab has posts, also refresh it to potentially show the new post
    if (feedData.trending.posts.length > 0) {
      fetchPosts("trending", 1, true, true);
    }
  };

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!currentUserId) return; // Don't set up observer until user is loaded

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target?.isIntersecting && feedData[activeTab].hasMore && !loading && !refreshing) {
          loadMorePosts();
        }
      },
      { threshold: 1.0, rootMargin: "100px" }
    );

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMorePosts, activeTab, feedData, loading, refreshing, currentUserId]);

  // Initial data fetch
  useEffect(() => {
    const initializeFeed = async () => {
      await fetchUserData();
      await fetchPosts("following", 1, true, true);
    };
    
    initializeFeed();
  }, []);

  const currentPosts = feedData[activeTab].posts;
  const hasMore = feedData[activeTab].hasMore;

  if (initialLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading feed...</div>
        </div>
      </div>
    );
  }

  return (
    <>
    {currentUserId && <Header currentUserId={currentUserId} />}
    <main className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Your Feed</h1>
      <CreatePostForm onPostCreated={handlePostCreated} />
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => handleTabChange("following")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "following"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Following
        </button>
        <button
          onClick={() => handleTabChange("trending")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "trending"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Trending
        </button>
        
        {/* Refresh Button */}
        <div className="ml-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 flex items-center space-x-1"
          >
            <svg 
              className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {currentPosts.length === 0 && !loading ? (
          <div className="text-center py-8 text-gray-500">
            {activeTab === "following" 
              ? "No posts from people you follow yet. Start following some users!" 
              : "No trending posts at the moment."}
          </div>
        ) : (
          currentUserId && currentPosts.map((post: Post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUserId={currentUserId} 
              showComment={false}
            />
          ))
        )}
      </div>

      {/* Loading Indicator and Infinite Scroll Trigger */}
      {hasMore && (
        <div 
          ref={loadingRef}
          className="flex justify-center items-center py-8"
        >
          {loading ? (
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span>Loading more posts...</span>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Scroll for more posts</div>
          )}
        </div>
      )}

      {/* End of Feed Message */}
      {!hasMore && currentPosts.length > 0 && (
        <div className="text-center py-8 text-gray-400 text-sm border-t">
          You've reached the end of your {activeTab} feed
        </div>
      )}
    </main>
    </>
  );
}