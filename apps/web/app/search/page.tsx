"use client";
import { useState, useEffect } from "react";
import { api } from "../../lib/axios";
import { useDebounce } from "../hooks/useDebounce";
import PostCard from "../components/PostCard";
import Header from "../components/Header"; 

interface Post {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  author: { id: string; name: string; };
  likes: { userId: string; }[];
  _count: { comments: number; };
}

interface SearchResultUser {
  id: string;
  name: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ posts: Post[]; users: SearchResultUser[] }>({ posts: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedQuery = useDebounce(query, 500); 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRes = await api.get("/auth/me");
        setCurrentUserId(userRes.data.id);
      } catch (err) {
        console.error("Failed to load user data for search page");
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults({ posts: [], users: [] });
      setHasSearched(false); 
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      setError("");
      setHasSearched(true);
      try {
        const response = await api.get(`/search?q=${debouncedQuery}`);
        setResults(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch search results");
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  return (
    <>
      {currentUserId && <Header currentUserId={currentUserId} />}
      
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-4">Search</h1>
        <div className="mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for posts or users by keyword..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            autoFocus 
          />
        </div>

        <div className="min-h-[400px]">
          {loading && <div className="text-center py-4 text-gray-500">Searching...</div>}
          {error && <div className="text-center py-4 text-red-500">{error}</div>}
          
          {!loading && !hasSearched && (
            <div className="text-center py-8 text-gray-400">
              <p>Find posts and users across the platform.</p>
            </div>
          )}

          {!loading && hasSearched && results.posts.length === 0 && results.users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="font-semibold">No results found for "{debouncedQuery}"</p>
              <p className="text-sm mt-2">Please try a different search term.</p>
            </div>
          )}

          {!loading && (results.posts.length > 0 || results.users.length > 0) && (
            <div className="space-y-8">
              {results.users.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold mb-3 border-b pb-2">Users</h2>
                  <div className="space-y-3 mt-4">
                    {results.users.map(user => (
                      <div key={user.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <a href={`/profile/${user.id}`} className="font-medium text-blue-600 hover:underline">{user.name}</a>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {results.posts.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold mb-3 border-b pb-2">Posts</h2>
                  <div className="space-y-4 mt-4">
                    {currentUserId && results.posts.map(post => (
                      <PostCard key={post.id} post={post} currentUserId={currentUserId} showComment={false} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
