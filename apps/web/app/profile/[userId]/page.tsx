import { api } from "../../../lib/axios";
import { notFound } from "next/navigation";

interface Props {
  params: { userId: string };
}

export default async function UserProfilePage({ params }: Props) {
  const { userId } = params;
  let user, posts;

  try {
    const userRes = await api.get(`/users/${userId}`);
    user = userRes.data;

    const postsRes = await api.get(`/users/${userId}/posts`);
    posts = postsRes.data;
  } catch (err) {
    console.log(err);
    return notFound(); // handle 404 or error
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-2">{user.name}'s Profile</h1>
      <p className="text-gray-500 mb-4">Joined: {new Date(user.createdAt).toDateString()}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Posts</h2>
      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-sm text-gray-500">No posts yet.</p>
        ) : (
          posts.map((post: any) => (
            <div key={post.id} className="border p-3 rounded">
              <h3 className="font-semibold">{post.content}</h3>
              <p className="text-sm text-gray-600">{post.createdAt}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
