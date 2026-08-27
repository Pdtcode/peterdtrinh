import { Link } from "@heroui/link";
import NextLink from "next/link";
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { format } from "date-fns";

import BlogCard from "./BlogCard";

import { BlogPost as BlogPostType, BlogPostPreview } from "@/types/sanity";
import { urlFor } from "@/lib/sanity";
import { title, container, section, tag } from "@/components/primitives";

interface BlogPostProps {
  post: BlogPostType;
  relatedPosts?: BlogPostPreview[];
}

const portableTextComponents = {
  types: {
    image: ({ value }: any) => (
      <figure className="my-10">
        <Image
          alt={value.alt || ""}
          className="w-full rounded-xl border border-line object-cover"
          height={506}
          src={urlFor(value).width(900).height(506).url()}
          width={900}
        />
        {value.alt && (
          <figcaption className="mt-3 text-center font-mono text-xs text-muted">
            {value.alt}
          </figcaption>
        )}
      </figure>
    ),
  },
  block: {
    h1: ({ children }: any) => (
      <h2 className="mb-5 mt-12 text-3xl font-semibold tracking-tight text-ink first:mt-0">
        {children}
      </h2>
    ),
    h2: ({ children }: any) => (
      <h2 className="mb-4 mt-12 text-2xl font-semibold tracking-tight text-ink">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="mb-3 mt-8 text-xl font-semibold tracking-tight text-ink">
        {children}
      </h3>
    ),
    normal: ({ children }: any) => (
      <p className="mb-6 text-lg leading-relaxed text-ink/85">{children}</p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="my-8 border-l-2 border-accent pl-6 text-lg italic leading-relaxed text-muted">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="mb-6 ml-1 list-disc space-y-2 pl-5 text-lg text-ink/85 marker:text-accent">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="mb-6 ml-1 list-decimal space-y-2 pl-5 text-lg text-ink/85 marker:text-muted">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => (
      <li className="leading-relaxed">{children}</li>
    ),
    number: ({ children }: any) => (
      <li className="leading-relaxed">{children}</li>
    ),
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-semibold text-ink">{children}</strong>
    ),
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => (
      <code className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[0.9em] text-accent">
        {children}
      </code>
    ),
    link: ({ children, value }: any) => (
      <Link
        className="text-accent underline underline-offset-4 hover:opacity-80"
        href={value.href}
        isExternal={value.href?.startsWith("http")}
      >
        {children}
      </Link>
    ),
  },
};

export default function BlogPost({ post, relatedPosts = [] }: BlogPostProps) {
  const formattedDate = format(new Date(post.publishedAt), "MMMM d, yyyy");

  return (
    <>
      <article>
        <header
          className={container({ width: "narrow", class: "pt-12 sm:pt-16" })}
        >
          <NextLink
            className="font-mono text-xs uppercase tracking-label text-muted transition-colors hover:text-accent"
            href="/blog"
          >
            ← All writing
          </NextLink>

          <h1
            className={title({
              size: "lg",
              class: "mt-8 leading-[1.1]",
            })}
          >
            {post.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs uppercase tracking-label text-muted">
            {post.author?.image && (
              <Image
                alt=""
                className="rounded-full"
                height={24}
                src={urlFor(post.author.image).width(48).height(48).url()}
                width={24}
              />
            )}
            {post.author?.name && <span>{post.author.name}</span>}
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt}>{formattedDate}</time>
            {post.readingTime && (
              <>
                <span aria-hidden="true">·</span>
                <span>{post.readingTime} min read</span>
              </>
            )}
          </div>

          {post.excerpt && (
            <p className="mt-8 border-l-2 border-accent pl-5 text-xl leading-relaxed text-muted">
              {post.excerpt}
            </p>
          )}

          {(post.categories?.length || post.tags?.length) && (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.categories?.map((category) => (
                <span key={category._id} className={tag()}>
                  {category.title}
                </span>
              ))}
              {post.tags?.map((t) => (
                <span key={t} className={tag()}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </header>

        {post.mainImage && (
          <div className={container({ width: "default", class: "mt-12" })}>
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-line bg-paper">
              <Image
                fill
                priority
                alt={post.mainImage.alt || post.title}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
                src={urlFor(post.mainImage).width(1600).height(900).url()}
              />
            </div>
          </div>
        )}

        <div className={container({ width: "narrow", class: "pt-12 pb-16" })}>
          <PortableText components={portableTextComponents} value={post.body} />
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className={container({ width: "wide", class: section() })}>
          <h2
            className={title({
              size: "sm",
              class: "border-b border-line pb-4",
            })}
          >
            Related reading
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((relatedPost) => (
              <BlogCard key={relatedPost._id} post={relatedPost} />
            ))}
          </div>
        </section>
      )}

      <div
        className={container({ width: "narrow", class: "pb-24 text-center" })}
      >
        <NextLink
          className="inline-block rounded-full border border-line px-6 py-3 font-mono text-xs uppercase tracking-label text-ink transition-colors hover:border-accent hover:text-accent"
          href="/blog"
        >
          ← Back to all posts
        </NextLink>
      </div>
    </>
  );
}
