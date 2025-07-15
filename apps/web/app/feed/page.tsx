"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/axios";
import PostCard from "../components/PostCard";
import CreatePostForm from "../components/createPostForm";


export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState("");

    
  const fetchFeed = async () => {
    try {
      const [userRes, postsRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/posts"),
      ]);
      setCurrentUserId(userRes.data.id);
      setPosts(postsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load feed");
    }
  };

  useEffect(() => {

    fetchFeed();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Your Feed</h1>
      <CreatePostForm onPostCreated={fetchFeed} />
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {posts.length === 0 && <p>No posts yet.</p>}
      {currentUserId &&
        posts.map((post: any) => (
          <PostCard key={post.id} post={post} currentUserId={currentUserId} />
        ))}
    </div>
  );
}
