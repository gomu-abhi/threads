"use client"
import { api } from "../../../lib/axios";
import PostCard from "../../components/PostCard";
import { useEffect, useState } from "react";

interface Props {
  params: { userId: string };
}

interface User {
  name : string,
  createdAt : Date,
}

export default function PostDetailPage({ params }: Props) {
  const [currentUserId, setCurrentUserId] = useState<string>();
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState<User>();
  const [error, setError] = useState("");
  const { userId } = params;
  const fetchUser = async() => {
    try{
        const [currUserRes, userRes, postsRes] = await Promise.all([
            api.get("/auth/me"),
            api.get(`/users/${userId}`),
            api.get(`/users/${userId}/posts`)
          ]);
          setCurrentUserId(currUserRes.data.id);
          setUser(userRes.data);
          setPosts(postsRes.data);
    }
    catch(err : any) {
        setError(err.response?.data?.message || "Failed to load feed");
    }
  }
    
  useEffect(() => {
    fetchUser();
  }, [])
  return (
    <div className="max-w-2xl mx-auto mt-8">
      {user && <h1 className="text-2xl font-bold mb-2">{user.name}</h1>}
      {user && <p className="text-gray-500 mb-4">
        Joined: {new Date(user.createdAt).toDateString()}
      </p>}

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
