"use client";

import { useState } from "react";
import { treeifyError, z } from "zod";
import { api } from "../../lib/axios";
import { useRouter } from "next/navigation";
import { format } from "path";

const postSchema = z.object({
  content: z.string().min(1, "Post content cannot be empty").max(280, "Max 280 characters"),
});

export default function CreatePostForm({ onPostCreated }: { onPostCreated?: () => void }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsed = postSchema.safeParse({ content });
    if (!parsed.success) {
        const tree = z.treeifyError(parsed.error);

        const props = tree.properties || {};

        for (const [_, val] of Object.entries(props)) {
            if (val.errors?.length) {
                setError(val.errors[0] ?? "Invalid input");
            }
        }
        return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/posts", { content: parsed.data.content });
      setContent("");
      onPostCreated?.(); // Optional callback
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded shadow">
      <textarea
        className="w-full border border-gray-300 rounded p-2 "
        rows={3}
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}

      <div className="text-right mt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-accent text-white px-4 py-2 rounded hover:bg-opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}
