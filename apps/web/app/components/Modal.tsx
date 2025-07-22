// components/FollowModal.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/axios";

interface FollowModalProps {
  type: "followers" | "following";
  userId: string;
  onClose: () => void;
}

interface User {
  id: string;
  name: string;
}

export default function FollowModal({ type, userId, onClose }: FollowModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get(`/users/${userId}/${type}?page=${page}`);
      setUsers(res.data.users);
      setTotal(res.data.total);
    };
    fetchData();
  }, [userId, type, page]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-start pt-44">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div className = "flex flex-row items-center mb-4 justify-between">
          <h2 className="text-xl font-semibold capitalize">{type}</h2>
          <button onClick={onClose} className="text-gray-600">✕</button>
        </div>

        {users.length === 0 ? (
          <p className="text-gray-500">No {type} found.</p>
        ) : (
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user.id}>
                <Link href={`/profile/${user.id}`} className="text-blue-600">
                  {user.name}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        <div className="flex justify-between mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="text-sm px-2 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="text-sm px-2 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
