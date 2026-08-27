import NextLink from "next/link";
import Image from "next/image";
import { format } from "date-fns";

import { BlogPostPreview } from "@/types/sanity";
import { urlFor } from "@/lib/sanity";
import { card, tag } from "@/components/primitives";

interface BlogCardProps {
  post: BlogPostPreview;
}

export default function BlogCard({ post }: BlogCardProps) {
  const href = `/blog/${post.slug.current}`;
  const formattedDate = format(new Date(post.publishedAt), "MMM d, yyyy");

  return (
    <article className={card({ interactive: true, class: "flex flex-col" })}>
      {post.mainImage && (
        <NextLink className="block" href={href} tabIndex={-1}>
          <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-paper">
            <Image
              fill
              alt={post.mainImage.alt || post.title}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src={urlFor(post.mainImage).width(800).height(500).url()}
            />
          </div>
        </NextLink>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.7rem] uppercase tracking-label text-muted">
          <time dateTime={post.publishedAt}>{formattedDate}</time>
          {post.readingTime && (
            <>
              <span aria-hidden="true">·</span>
              <span>{post.readingTime} min read</span>
            </>
          )}
        </div>

        <h3 className="mt-3 text-xl font-semibold leading-snug tracking-tight text-ink">
          <NextLink
            className="transition-colors hover:text-accent after:absolute after:inset-0 after:content-['']"
            href={href}
          >
            {post.title}
          </NextLink>
        </h3>

        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
          {post.excerpt}
        </p>

        {(post.categories?.length || post.tags?.length) && (
          <div className="mt-5 flex flex-wrap gap-2">
            {post.categories?.slice(0, 2).map((category) => (
              <span key={category.slug.current} className={tag()}>
                {category.title}
              </span>
            ))}
            {post.tags?.slice(0, 1).map((t) => (
              <span key={t} className={tag()}>
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
