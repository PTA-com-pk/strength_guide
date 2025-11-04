'use client'

import { useEffect } from 'react'

interface ArticleStructuredDataProps {
  article: {
    _id: string
    title: string
    slug: string
    excerpt?: string
    content: string
    heroImage?: string
    publishedAt?: Date | string
    updatedAt?: Date | string
    author: {
      name: string
      avatar?: string
    }
    category: {
      name: string
      slug: string
    }
    tags: Array<{
      name: string
      slug: string
    }>
  }
  baseUrl: string
}

export function ArticleStructuredData({ article, baseUrl }: ArticleStructuredDataProps) {
  useEffect(() => {
    const publishedTime = article.publishedAt
      ? typeof article.publishedAt === 'string'
        ? new Date(article.publishedAt).toISOString()
        : article.publishedAt.toISOString()
      : new Date().toISOString()

    const modifiedTime = article.updatedAt
      ? typeof article.updatedAt === 'string'
        ? new Date(article.updatedAt).toISOString()
        : article.updatedAt.toISOString()
      : publishedTime

    // Article structured data (enhanced SEO)
    const articleStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt || article.title,
      image: article.heroImage ? [
        {
          '@type': 'ImageObject',
          url: article.heroImage,
          width: 1200,
          height: 630,
        },
      ] : [],
      datePublished: publishedTime,
      dateModified: modifiedTime,
      author: {
        '@type': 'Person',
        name: article.author.name,
        image: article.author.avatar,
        url: `${baseUrl}/author/${article.author.name.toLowerCase().replace(/\s+/g, '-')}`,
      },
      publisher: {
        '@type': 'Organization',
        name: 'StrengthGuide',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`,
          width: 512,
          height: 512,
        },
        url: baseUrl,
        sameAs: [
          // Add social media URLs here
        ],
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${baseUrl}/${article.category.slug}/${article.slug}`,
      },
      articleSection: article.category.name,
      keywords: article.tags.map((tag) => tag.name).join(', '),
      wordCount: article.content ? article.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0,
      inLanguage: 'en-US',
    }

    // Breadcrumb structured data
    const breadcrumbStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: article.category.name,
          item: `${baseUrl}/category/${article.category.slug}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: article.title,
          item: `${baseUrl}/${article.category.slug}/${article.slug}`,
        },
      ],
    }

    // Organization structured data
    const organizationStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'StrengthGuide',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      description: 'Your ultimate resource for fitness, nutrition, and strength training advice.',
      sameAs: [
        // Add social media links here when available
      ],
    }

    // Add scripts to document
    const script1 = document.createElement('script')
    script1.type = 'application/ld+json'
    script1.id = 'article-structured-data'
    script1.text = JSON.stringify(articleStructuredData)

    const script2 = document.createElement('script')
    script2.type = 'application/ld+json'
    script2.id = 'breadcrumb-structured-data'
    script2.text = JSON.stringify(breadcrumbStructuredData)

    const script3 = document.createElement('script')
    script3.type = 'application/ld+json'
    script3.id = 'organization-structured-data'
    script3.text = JSON.stringify(organizationStructuredData)

    // Remove existing scripts if they exist
    const existing1 = document.getElementById('article-structured-data')
    const existing2 = document.getElementById('breadcrumb-structured-data')
    const existing3 = document.getElementById('organization-structured-data')
    
    if (existing1) existing1.remove()
    if (existing2) existing2.remove()
    if (existing3) existing3.remove()

    document.head.appendChild(script1)
    document.head.appendChild(script2)
    document.head.appendChild(script3)

    return () => {
      // Cleanup on unmount
      const scripts = [
        document.getElementById('article-structured-data'),
        document.getElementById('breadcrumb-structured-data'),
        document.getElementById('organization-structured-data'),
      ]
      scripts.forEach((script) => {
        if (script) script.remove()
      })
    }
  }, [article, baseUrl])

  return null
}

interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string
    url: string
  }>
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  useEffect(() => {
    const breadcrumbStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = 'breadcrumb-structured-data'
    script.text = JSON.stringify(breadcrumbStructuredData)

    const existing = document.getElementById('breadcrumb-structured-data')
    if (existing) existing.remove()

    document.head.appendChild(script)

    return () => {
      const scriptElement = document.getElementById('breadcrumb-structured-data')
      if (scriptElement) scriptElement.remove()
    }
  }, [items])

  return null
}

