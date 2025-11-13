import BlogCard from "./BlogCard";

import { BlogPostPreview } from "@/types/sanity";

interface BlogListProps {
  posts: BlogPostPreview[];
}

export default function BlogList({ posts }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-2xl font-semibold text-default-600 mb-4">
          No blog posts found
        </h3>
        <p className="text-default-500 text-lg">
          Check back later for new content!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <BlogCard key={post._id} post={post} />
      ))}
    </div>
  );
}
