"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/axios";

interface Author {
  id: string;
  name: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: Author;
}

interface Props {
  postId: string;
  currentUserId: string;
}

export default function CommentThread({ postId, currentUserId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.get(`/comments/${postId}`);
        setComments(res.data);
      } catch (err) {
        console.error("Failed to load comments", err);
      }
    };

    fetchComments();
  }, [postId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.post(`/comments/${postId}`, {
        content: newComment,
      });

      setComments((prev) => [...prev, res.data]);
      setNewComment("");
    } catch (err) {
      alert("Failed to post comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Failed to delete comment.");
    }
  };

  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2 text-gray-700">Comments</h3>

      <div className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="Write a comment..."
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="mt-2 bg-accent text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Post Comment
        </button>
      </div>

      {comments.length === 0 ? (
        <p className="text-sm text-gray-500">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="border p-3 rounded relative group">
              <div className="text-sm text-gray-700">
                <span className="font-semibold">{comment.user.name}</span>{" "}
                <span className="text-gray-500 text-xs">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-gray-800">{comment.content}</p>

              {comment.user.id === currentUserId && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="absolute top-2 right-2 text-xs text-red-600 hover:underline"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}