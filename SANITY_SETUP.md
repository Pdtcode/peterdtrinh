# Sanity.io CMS Setup Guide

This guide will help you set up Sanity.io CMS for your blog.

## Prerequisites

1. Create a Sanity account at [sanity.io](https://www.sanity.io/)
2. Install Sanity CLI globally: `npm install -g @sanity/cli`

## Step 1: Create a Sanity Project

1. Run `sanity init` in a separate directory (not in this project)
2. Choose "Create new project"
3. Give your project a name (e.g., "Peter Trinh Blog")
4. Choose "Blog" as the project template
5. Note down your Project ID and Dataset name

## Step 2: Update Environment Variables

Update your `.env.local` file with your actual Sanity project details:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your-actual-project-id
NEXT_PUBLIC_SANITY_DATASET=production
```

## Step 3: Schema Configuration

Your Sanity project should include these schemas (the blog template includes them):

### Blog Post Schema
- Title (string)
- Slug (slug)
- Author (reference to author)
- Main Image (image)
- Categories (array of references to category)
- Tags (array of strings)
- Published At (datetime)
- Excerpt (text)
- Body (block content)
- Reading Time (number)

### Author Schema
- Name (string)
- Slug (slug)
- Image (image)
- Bio (block content)

### Category Schema
- Title (string)
- Slug (slug)
- Description (text)

## Step 4: Deploy Sanity Studio

1. Navigate to your Sanity project directory
2. Run `sanity deploy` to deploy your Sanity Studio
3. Choose a studio hostname (e.g., `your-blog-studio`)
4. Your studio will be available at `https://your-blog-studio.sanity.studio`

## Step 5: Add Content

1. Go to your Sanity Studio URL
2. Create some authors first
3. Create categories (optional)
4. Create blog posts with:
   - Title and slug
   - Author
   - Featured image
   - Content using the rich text editor
   - Categories and tags
   - Published date

## Step 6: Configure CORS (if needed)

If you encounter CORS issues:

1. Go to [manage.sanity.io](https://manage.sanity.io)
2. Select your project
3. Go to Settings > API
4. Add your domain (e.g., `http://localhost:3000` for development)

## Troubleshooting

### Common Issues:

1. **"Cannot resolve sanity client"**: Make sure your environment variables are set correctly
2. **CORS errors**: Add your domain to the CORS origins in Sanity project settings
3. **No content showing**: Ensure your blog posts are published and have the correct schema structure

### Useful Commands:

- `sanity start` - Start the local studio
- `sanity deploy` - Deploy studio to Sanity's hosting
- `sanity dataset export` - Export your data
- `sanity dataset import` - Import data

## Schema Files for Reference

If you need to customize the schemas, here are the basic structures:

### blogPost.js
```javascript
export default {
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: {type: 'author'},
      validation: Rule => Rule.required()
    },
    {
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        }
      ]
    },
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: {type: 'category'}}],
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
    },
    {
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      validation: Rule => Rule.required()
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required()
    },
    {
      name: 'body',
      title: 'Body',
      type: 'blockContent',
      validation: Rule => Rule.required()
    },
    {
      name: 'readingTime',
      title: 'Reading Time (minutes)',
      type: 'number',
    }
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const {author} = selection
      return Object.assign({}, selection, {
        subtitle: author && `by ${author}`,
      })
    },
  },
}
```

Once you've completed these steps, your blog should be fully functional with Sanity CMS!