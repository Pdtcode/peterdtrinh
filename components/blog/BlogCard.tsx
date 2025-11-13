import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import NextLink from "next/link";
import Image from "next/image";
import { format } from "date-fns";

import { BlogPostPreview } from "@/types/sanity";
import { urlFor } from "@/lib/sanity";

interface BlogCardProps {
  post: BlogPostPreview;
}

export default function BlogCard({ post }: BlogCardProps) {
  const formattedDate = format(new Date(post.publishedAt), "MMM dd, yyyy");

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      {post.mainImage && (
        <CardHeader className="p-0">
          <div className="relative w-full aspect-video overflow-hidden rounded-t-lg">
            <Image
              fill
              alt={post.mainImage.alt || post.title}
              className="object-cover hover:scale-105 transition-transform duration-300"
              src={urlFor(post.mainImage).width(400).height(225).url()}
            />
          </div>
        </CardHeader>
      )}

      <CardBody className="p-6">
        <div className="flex flex-col h-full space-y-4">
          <div>
            <NextLink href={`/blog/${post.slug.current}`}>
              <h3 className="text-xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-2">
                {post.title}
              </h3>
            </NextLink>

            <div className="flex items-center gap-3 mt-3 text-sm text-default-500">
              <div className="flex items-center gap-2">
                {post.author.image && (
                  <Image
                    alt={post.author.name}
                    className="rounded-full"
                    height={24}
                    src={urlFor(post.author.image).width(24).height(24).url()}
                    width={24}
                  />
                )}
                <span>{post.author.name}</span>
              </div>
              <span>•</span>
              <span>{formattedDate}</span>
              {post.readingTime && (
                <>
                  <span>•</span>
                  <span>{post.readingTime} min read</span>
                </>
              )}
            </div>
          </div>

          <p className="text-default-600 line-clamp-3 flex-grow">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap gap-2">
            {post.categories?.slice(0, 2).map((category) => (
              <Chip
                key={category.slug.current}
                className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                color="primary"
                size="sm"
                variant="flat"
              >
                {category.title}
              </Chip>
            ))}
            {post.tags?.slice(0, 1).map((tag) => (
              <Chip
                key={tag}
                className="hover:bg-secondary hover:text-secondary-foreground transition-colors cursor-pointer"
                color="secondary"
                size="sm"
                variant="flat"
              >
                {tag}
              </Chip>
            ))}
          </div>
        </div>
      </CardBody>

      <CardFooter className="pt-0 px-6 pb-6">
        <Link
          showAnchorIcon
          as={NextLink}
          className="text-primary hover:text-primary-600 font-medium"
          href={`/blog/${post.slug.current}`}
        >
          Read more
        </Link>
      </CardFooter>
    </Card>
  );
}
