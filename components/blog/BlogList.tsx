import BlogCard from "./BlogCard";

import { BlogPostPreview } from "@/types/sanity";

interface BlogListProps {
  posts: BlogPostPreview[];
}

export default function BlogList({ posts }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line px-8 py-16 text-center">
        <p className="eyebrow">Nothing published yet</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          First posts are in progress. Check back soon, or subscribe to the feed
          to get them when they land.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard key={post._id} post={post} />
      ))}
    </div>
  );
}
