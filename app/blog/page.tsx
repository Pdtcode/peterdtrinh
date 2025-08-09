import { getAllBlogPosts } from "@/lib/sanity-queries";
import BlogList from "@/components/blog/BlogList";

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="space-y-8">
      <BlogList posts={posts} />
    </div>
  );
}
