import { client } from "./sanity";

import { BlogPost, BlogPostPreview, Category } from "@/types/sanity";

// GROQ queries
export const blogPostsQuery = `
  *[_type == "blogPost" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    mainImage {
      asset-> {
        _id,
        url
      },
      alt
    },
    author-> {
      name,
      image {
        asset-> {
          _id,
          url
        },
        alt
      }
    },
    categories[]-> {
      title,
      slug
    },
    tags,
    publishedAt,
    readingTime
  }
`;

export const blogPostBySlugQuery = `
  *[_type == "blogPost" && slug.current == $slug][0] {
    _id,
    _createdAt,
    _updatedAt,
    title,
    slug,
    excerpt,
    mainImage {
      asset-> {
        _id,
        url
      },
      alt
    },
    body,
    author-> {
      _id,
      name,
      slug,
      image {
        asset-> {
          _id,
          url
        },
        alt
      },
      bio
    },
    categories[]-> {
      _id,
      title,
      slug,
      description
    },
    tags,
    publishedAt,
    readingTime
  }
`;

export const blogPostSlugsQuery = `
  *[_type == "blogPost" && defined(slug.current)].slug.current
`;

export const relatedPostsQuery = `
  *[_type == "blogPost" && slug.current != $slug && count(categories[@._ref in $categories]) > 0] | order(publishedAt desc) [0...3] {
    _id,
    title,
    slug,
    excerpt,
    mainImage {
      asset-> {
        _id,
        url
      },
      alt
    },
    author-> {
      name,
      image {
        asset-> {
          _id,
          url
        },
        alt
      }
    },
    categories[]-> {
      title,
      slug
    },
    publishedAt,
    readingTime
  }
`;

// API functions
export async function getAllBlogPosts(): Promise<BlogPostPreview[]> {
  return client.fetch(blogPostsQuery);
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  return client.fetch(blogPostBySlugQuery, { slug });
}

export async function getAllBlogPostSlugs(): Promise<string[]> {
  return client.fetch(blogPostSlugsQuery);
}

export async function getRelatedPosts(
  slug: string,
  categories: string[],
): Promise<BlogPostPreview[]> {
  return client.fetch(relatedPostsQuery, { slug, categories });
}

export async function getBlogPostsByCategory(
  categorySlug: string,
): Promise<BlogPostPreview[]> {
  const query = `
    *[_type == "blogPost" && $categorySlug in categories[]->slug.current] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      mainImage {
        asset-> {
          _id,
          url
        },
        alt
      },
      author-> {
        name,
        image {
          asset-> {
            _id,
            url
          },
          alt
        }
      },
      categories[]-> {
        title,
        slug
      },
      tags,
      publishedAt,
      readingTime
    }
  `;

  return client.fetch(query, { categorySlug });
}

export async function getAllCategories(): Promise<Category[]> {
  const query = `
    *[_type == "category"] | order(title asc) {
      _id,
      title,
      slug,
      description
    }
  `;

  return client.fetch(query);
}

export async function searchBlogPosts(
  searchTerm: string,
): Promise<BlogPostPreview[]> {
  const query = `
    *[_type == "blogPost" && (
      title match $searchTerm + "*" ||
      excerpt match $searchTerm + "*" ||
      $searchTerm in tags
    )] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      mainImage {
        asset-> {
          _id,
          url
        },
        alt
      },
      author-> {
        name,
        image {
          asset-> {
            _id,
            url
          },
          alt
        }
      },
      categories[]-> {
        title,
        slug
      },
      tags,
      publishedAt,
      readingTime
    }
  `;

  return client.fetch(query, { searchTerm });
}
