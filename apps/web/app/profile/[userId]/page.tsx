"use client";
import { api } from "../../../lib/axios";
import PostCard from "../../components/PostCard";
import FollowModal from "../../components/Modal";
import { useEffect, useState } from "react";

interface Props {
  params: { userId: string };
}

interface User {
  name: string;
  createdAt: Date;
  isFollowing?: boolean;
}

export default function UserDetailPage({ params }: Props) {
  const [currentUserId, setCurrentUserId] = useState<string>();
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState<User>();
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });

  const { userId } = params;

  const fetchUser = async () => {
    try {
      const [currUserRes, userRes, postsRes] = await Promise.all([
        api.get("/auth/me"),
        api.get(`/users/${userId}`),
        api.get(`/users/${userId}/posts`)
      ]);
      setCurrentUserId(currUserRes.data.id);
      setUser(userRes.data);
      setIsFollowing(userRes.data.isFollowing);
      setPosts(postsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load feed");
    }
  };

  const handleToggleFollow = async () => {
    try {
      await api.post(`/users/follow/${userId}`);
      setIsFollowing((prev) => !prev); // optimistic UI
    } catch (err: any) {
      console.error("Toggle follow failed:", err);
    }
  };
  
  const fetchCounts = async () => {
    const res = await api.get(`/users/${userId}/follow-counts`);
    setCounts(res.data); // { followers: number, following: number }
  };
  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [isFollowing]);

  return (
    <div className="max-w-2xl mx-auto mt-8">
      {user && (
        <>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            {currentUserId && currentUserId !== userId && (
              <button
                onClick={handleToggleFollow}
                className={`px-4 py-1 rounded ${isFollowing ? "bg-gray-300 text-black" : "bg-accent text-white"
                  }`}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
          <p className="text-gray-500 mb-4">
            Joined: {new Date(user.createdAt).toDateString()}
          </p>
        </>
      )}
      <div className="flex gap-4 text-sm text-gray-700 mb-4">
        <button onClick={() => setShowFollowers(true)}>
          <strong>{counts.followers}</strong> Followers
        </button>
        <button onClick={() => setShowFollowing(true)}>
          <strong>{counts.following}</strong> Following
        </button>
      </div>

      {showFollowers && (
        <FollowModal type="followers" userId={userId} onClose={() => setShowFollowers(false)} />
      )}

      {showFollowing && (
        <FollowModal type="following" userId={userId} onClose={() => setShowFollowing(false)} />
      )}

      <h2 className="text-xl font-semibold mt-6 mb-2">Posts</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {posts.length === 0 && <p>No posts yet.</p>}
      <div>
        {currentUserId &&
          posts.map((post: any) => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} showComment={false} />
          ))}
      </div>
    </div>
  );
}
