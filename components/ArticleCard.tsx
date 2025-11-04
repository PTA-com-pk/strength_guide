'use client'

import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { ArticleListItem } from '@/lib/types'

interface ArticleCardProps {
  article: ArticleListItem
  featured?: boolean
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  // Build article URL with category
  const articleUrl = article.category?.slug 
    ? `/${article.category.slug}/${article.slug}`
    : `/articles/${article.slug}` // Fallback for legacy URLs

  return (
    <Link
      href={articleUrl}
      className={`group block transition-transform hover:scale-[1.02] ${
        featured ? 'md:col-span-2' : ''
      }`}
    >
      <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-200">
        {article.heroImage && (
          <div className={`relative ${featured ? 'h-80 md:h-96' : 'h-56'} overflow-hidden bg-dark-900`}>
            <Image
              src={article.heroImage}
              alt={`${article.title} - ${article.category.name} article`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes={featured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
              loading={featured ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="inline-block px-3 py-1 text-xs font-bold text-white bg-primary-600 rounded-full uppercase tracking-wide">
                {article.category.name}
              </span>
            </div>
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center space-x-3 text-xs text-gray-500 mb-3">
            <time className="font-medium">
              {format(new Date(article.publishedAt!), 'MMM d, yyyy')}
            </time>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>{article.views.toLocaleString()}</span>
            </div>
            {article.commentCount > 0 && (
              <>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span>{article.commentCount}</span>
                </div>
              </>
            )}
          </div>
          <h2
            className={`font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2 ${
              featured ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
            }`}
          >
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="text-gray-600 line-clamp-2 mb-4 text-sm md:text-base">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {article.author.avatar && (
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <span className="text-sm font-semibold text-gray-700">{article.author.name}</span>
            </div>
            <span className="text-sm font-semibold text-primary-600 group-hover:text-primary-700">
              Read More →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
