"use client";

import { useState, useCallback } from "react";
import { api } from "../../lib/axios";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline"
import CommentThread from "./CommentThread";
import Link from "next/link";

interface Like {
    userId: string;
}

interface Author {
    id: string;
    name: string;
}

interface Post {
    id: string;
    content: string;
    createdAt: string;
    author: Author;
    likes: Like[];
    _count: {
        comments: number;
      };
}

interface Props {
    post: Post;
    currentUserId: string;
    onPostDeleted?: (postId: string) => void; // to refresh feed if needed
    showComment : boolean
}

export default function PostCard({ post, currentUserId, onPostDeleted, showComment }: Props) {
    const [likes, setLikes] = useState<Like[]>(post.likes);
    const [content, setContent] = useState(post.content);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editText, setEditText] = useState(post.content);
    const [showComments, setShowComments] =  useState(showComment);
    const hasLiked = likes.some((like) => like.userId === currentUserId);

    // Toggle Like (Optimistic Update)
    const toggleLike = useCallback(async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const prevLikes = likes;
        const updated = hasLiked
            ? likes.filter((l) => l.userId !== currentUserId)
            : [...likes, { userId: currentUserId }];
        setLikes(updated);

        try {
            await api.post(`/likes/${post.id}`);
        } catch (err) {
            console.error("Like toggle failed:", err);
            setLikes(prevLikes);
        } finally {
            setIsSubmitting(false);
        }
    }, [likes, hasLiked, currentUserId, post.id, isSubmitting]);

    // Save Edited Content
    const saveEdit = async () => {
        try {
            const res = await api.put(`/posts/${post.id}`, { content: editText });
            setContent(res.data.content);
            setIsEditing(false);
        } catch (err) {
            alert("Failed to update post.");
        }
    };

    // Delete Post
    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            await api.delete(`/posts/${post.id}`);
            if (onPostDeleted) onPostDeleted(post.id);
        } catch (err) {
            alert("Failed to delete post.");
        }
    };

    return (
        <div className="bg-white p-4 rounded shadow mb-4">
            <div className="mb-2 flex items-center justify-between gap-2 text-sm text-gray-600">
                <div>
                    <Link href={`/profile/${post.author.id}`}>
                        <span className="font-semibold text-primary">{post.author.name}</span>
                    </Link>
                    <span>·</span>
                    <span>{new Date(post.createdAt).toLocaleString()}</span>
                </div>
                {/* Show Edit/Delete only for author */}
                {currentUserId === post.author.id && !isEditing && (
                    <div className="flex gap-2 text-sm">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                            aria-label="Edit post"
                        >
                            <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                            aria-label="Delete post"
                        >
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>

            {isEditing ? (
                <div className="mb-4">
                    <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={saveEdit}
                            className="bg-accent text-white px-3 py-1 rounded"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="bg-gray-300 text-black px-3 py-1 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <Link href={`/post/${post.id}`}>
                    <p className="text-gray-800 mb-4">{content}</p>
                </Link>
            )}

            {/* Like and Comments Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleLike}
                    disabled={isSubmitting}
                    className={`px-3 py-1 rounded text-white transition ${hasLiked ? "bg-accent" : "bg-secondary"} ${isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`}
                >
                    {hasLiked ? "Unlike" : "Like"}
                </button>
                <span className="text-sm text-gray-700">
                    {likes.length} like{likes.length !== 1 ? "s" : ""}
                </span>

                <button
                    onClick={() => setShowComments(!showComments)}
                    className="ml-auto text-sm text-gray-600 hover:underline"
                >
                    {showComments ? "Hide" : "Show"} Comments({post._count.comments})
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <CommentThread postId={post.id} currentUserId={currentUserId} />
            )}
        </div>
    );
}