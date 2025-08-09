import { PortableTextBlock } from '@portabletext/types';

export interface SanityImageAsset {
  _id: string;
  url: string;
  alt?: string;
}

export interface SanityImage {
  _type: 'image';
  asset: SanityImageAsset;
  alt?: string;
}

export interface BlogPost {
  _id: string;
  _type: 'blogPost';
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: {
    current: string;
  };
  excerpt: string;
  mainImage?: SanityImage;
  body: PortableTextBlock[];
  author: Author;
  categories?: Category[];
  tags?: string[];
  publishedAt: string;
  readingTime?: number;
}

export interface Author {
  _id: string;
  _type: 'author';
  name: string;
  slug: {
    current: string;
  };
  image?: SanityImage;
  bio?: PortableTextBlock[];
}

export interface Category {
  _id: string;
  _type: 'category';
  title: string;
  slug: {
    current: string;
  };
  description?: string;
}

export interface BlogPostPreview {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  excerpt: string;
  mainImage?: SanityImage;
  author: {
    name: string;
    image?: SanityImage;
  };
  categories?: {
    title: string;
    slug: {
      current: string;
    };
  }[];
  tags?: string[];
  publishedAt: string;
  readingTime?: number;
}