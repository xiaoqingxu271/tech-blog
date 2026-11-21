"use client";

import PostEditor from "@/components/PostEditor";

export default function EditPostPage({ params }: { params: { id: string } }) {
  return <PostEditor postId={params.id} />;
}
