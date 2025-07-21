"use client"
import { api } from "../../../lib/axios";
import PostCard from "../../components/PostCard";
import { useEffect, useState } from "react";

interface Props {
  params: { postId: string };
}

export default function PostDetailPage({ params }: Props) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [post, setPost] = useState();
  const [error, setError] = useState("");
  const { postId } = params;
  const fetchUser = async() => {
    try{
        const [userRes, postsRes] = await Promise.all([
            api.get("/auth/me"),
            api.get(`/posts/${postId}`),
          ]);
          setCurrentUserId(userRes.data.id);
          setPost(postsRes.data);
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
      <h1 className="text-2xl font-bold mb-4">Post Details</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {currentUserId && post && <PostCard post={post} currentUserId={currentUserId} showComment = {true}/>}
    </div>
  );
}
