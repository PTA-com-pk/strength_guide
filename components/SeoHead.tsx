'use client'

import { useEffect } from 'react'
import Head from 'next/head'

interface SeoHeadProps {
  title?: string
  description?: string
  canonical?: string
  ogImage?: string
  ogType?: string
  twitterCard?: 'summary' | 'summary_large_image'
  keywords?: string[]
  author?: string
  publishedTime?: string
  modifiedTime?: string
  noindex?: boolean
  nofollow?: boolean
}

export default function SeoHead({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'article',
  twitterCard = 'summary_large_image',
  keywords = [],
  author,
  publishedTime,
  modifiedTime,
  noindex = false,
  nofollow = false,
}: SeoHeadProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const fullTitle = title ? `${title} | StrengthGuide` : 'StrengthGuide - Your Ultimate Strength Training Resource'
  const fullDescription = description || 'Get expert advice on muscle building, fat loss, nutrition, and strength training.'
  const canonicalUrl = canonical || baseUrl
  const ogImageUrl = ogImage || `${baseUrl}/og-image.jpg`

  useEffect(() => {
    // Update document title
    if (title) {
      document.title = fullTitle
    }

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    // Basic meta tags
    updateMetaTag('description', fullDescription)
    if (keywords.length > 0) {
      updateMetaTag('keywords', keywords.join(', '))
    }
    if (author) {
      updateMetaTag('author', author)
    }

    // Robots
    const robotsContent = `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`
    updateMetaTag('robots', robotsContent)

    // Open Graph
    updateMetaTag('og:title', fullTitle, 'property')
    updateMetaTag('og:description', fullDescription, 'property')
    updateMetaTag('og:type', ogType, 'property')
    updateMetaTag('og:url', canonicalUrl, 'property')
    updateMetaTag('og:image', ogImageUrl, 'property')
    updateMetaTag('og:site_name', 'StrengthGuide', 'property')

    // Twitter Card
    updateMetaTag('twitter:card', twitterCard)
    updateMetaTag('twitter:title', fullTitle)
    updateMetaTag('twitter:description', fullDescription)
    if (ogImage) {
      updateMetaTag('twitter:image', ogImageUrl)
    }

    // Article specific
    if (publishedTime) {
      updateMetaTag('article:published_time', publishedTime, 'property')
    }
    if (modifiedTime) {
      updateMetaTag('article:modified_time', modifiedTime, 'property')
    }
    if (author) {
      updateMetaTag('article:author', author, 'property')
    }

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]')
    if (!canonicalLink) {
      canonicalLink = document.createElement('link')
      canonicalLink.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalLink)
    }
    canonicalLink.setAttribute('href', canonicalUrl)
  }, [
    title,
    description,
    canonical,
    ogImage,
    ogType,
    twitterCard,
    keywords,
    author,
    publishedTime,
    modifiedTime,
    noindex,
    nofollow,
    fullTitle,
    fullDescription,
    canonicalUrl,
    ogImageUrl,
  ])

  return null
}

