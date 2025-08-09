import { notFound } from "next/navigation";
import { Metadata } from "next";

import {
  getBlogPostBySlug,
  getAllBlogPostSlugs,
  getRelatedPosts,
} from "@/lib/sanity-queries";
import BlogPost from "@/components/blog/BlogPost";

interface BlogPostPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getAllBlogPostSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | Peter Trinh`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const categoryIds = post.categories?.map((cat) => cat._id) || [];
  const relatedPosts = await getRelatedPosts(post.slug.current, categoryIds);

  return <BlogPost post={post} relatedPosts={relatedPosts} />;
}
