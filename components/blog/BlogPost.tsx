import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import NextLink from "next/link";
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { BlogPost as BlogPostType, BlogPostPreview } from "@/types/sanity";
import { urlFor } from "@/lib/sanity";
import { format } from "date-fns";
import BlogCard from "./BlogCard";

interface BlogPostProps {
  post: BlogPostType;
  relatedPosts?: BlogPostPreview[];
}

const portableTextComponents = {
  types: {
    image: ({ value }: any) => (
      <div className="my-8">
        <Image
          src={urlFor(value).width(800).height(450).url()}
          alt={value.alt || ''}
          width={800}
          height={450}
          className="rounded-lg object-cover w-full"
        />
        {value.alt && (
          <p className="text-sm text-default-500 text-center mt-2 italic">
            {value.alt}
          </p>
        )}
      </div>
    ),
  },
  block: {
    h1: ({ children }: any) => (
      <h1 className="text-4xl font-bold text-foreground mb-6 mt-8 first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-3xl font-semibold text-foreground mb-4 mt-8">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-2xl font-semibold text-foreground mb-3 mt-6">
        {children}
      </h3>
    ),
    normal: ({ children }: any) => (
      <p className="text-default-700 mb-4 leading-relaxed text-lg">
        {children}
      </p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary pl-6 my-6 italic text-default-600 text-lg">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc list-inside mb-4 space-y-2 text-default-700 ml-4">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal list-inside mb-4 space-y-2 text-default-700 ml-4">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => (
      <li className="text-default-700 text-lg">{children}</li>
    ),
    number: ({ children }: any) => (
      <li className="text-default-700 text-lg">{children}</li>
    ),
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => (
      <code className="bg-default-100 px-2 py-1 rounded text-sm font-mono text-primary">
        {children}
      </code>
    ),
    link: ({ children, value }: any) => (
      <Link
        href={value.href}
        className="text-primary hover:text-primary-600 underline"
        isExternal={value.href.startsWith('http')}
      >
        {children}
      </Link>
    ),
  },
};

export default function BlogPost({ post, relatedPosts = [] }: BlogPostProps) {
  const formattedDate = format(new Date(post.publishedAt), 'MMMM dd, yyyy');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back to Blog */}
      <div>
        <Button
          as={NextLink}
          href="/blog"
          variant="flat"
          size="sm"
          className="mb-6"
        >
          ← Back to Blog
        </Button>
      </div>

      {/* Article Header */}
      <article className="space-y-8">
        <header className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-default-600">
            <div className="flex items-center gap-3">
              {post.author.image && (
                <Image
                  src={urlFor(post.author.image).width(40).height(40).url()}
                  alt={post.author.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div>
                <p className="font-medium">{post.author.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span>{formattedDate}</span>
              {post.readingTime && (
                <>
                  <span>•</span>
                  <span>{post.readingTime} min read</span>
                </>
              )}
            </div>
          </div>

          {/* Categories and Tags */}
          <div className="flex flex-wrap gap-2">
            {post.categories?.map((category) => (
              <Chip
                key={category._id}
                size="sm"
                variant="flat"
                color="primary"
                className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
              >
                {category.title}
              </Chip>
            ))}
            {post.tags?.map((tag) => (
              <Chip
                key={tag}
                size="sm"
                variant="flat"
                color="secondary"
                className="hover:bg-secondary hover:text-secondary-foreground transition-colors cursor-pointer"
              >
                {tag}
              </Chip>
            ))}
          </div>

          {/* Featured Image */}
          {post.mainImage && (
            <div className="relative w-full aspect-video overflow-hidden rounded-lg">
              <Image
                src={urlFor(post.mainImage).width(800).height(450).url()}
                alt={post.mainImage.alt || post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Excerpt */}
          <p className="text-xl text-default-600 leading-relaxed font-medium">
            {post.excerpt}
          </p>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <PortableText value={post.body} components={portableTextComponents} />
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-16 pt-8 border-t border-default-200">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <BlogCard key={relatedPost._id} post={relatedPost} />
            ))}
          </div>
        </section>
      )}

      {/* Back to Top */}
      <div className="text-center pt-8">
        <Button
          as={NextLink}
          href="/blog"
          variant="flat"
          color="primary"
        >
          ← Back to All Posts
        </Button>
      </div>
    </div>
  );
}