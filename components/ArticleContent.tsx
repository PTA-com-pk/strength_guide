'use client'

import { useMemo } from 'react'
import AdBanner from './AdBanner'

interface ArticleContentProps {
  content: string
}

export default function ArticleContent({ content }: ArticleContentProps) {
  const processedContent = useMemo(() => {
    // Split content by closing paragraph tags to identify paragraphs
    const parts = content.split('</p>')
    
    if (parts.length <= 1) {
      // If no paragraphs found, return original content as single element
      return [{ type: 'html' as const, content, key: 'single-content' }]
    }

    // Check if HTML contains an image (img, figure, picture tags)
    const hasImage = (html: string): boolean => {
      const imagePattern = /<(img|figure|picture)[^>]*>/i
      return imagePattern.test(html)
    }

    // Find all image positions in the original content
    const imagePositions = new Set<number>()
    const imageRegex = /<(img|figure|picture)[^>]*>/gi
    let match
    while ((match = imageRegex.exec(content)) !== null) {
      // Find which paragraph index this image is closest to
      const imageIndex = content.substring(0, match.index).split('</p>').length - 1
      imagePositions.add(imageIndex)
      // Also mark adjacent paragraphs (before and after)
      if (imageIndex > 0) imagePositions.add(imageIndex - 1)
      imagePositions.add(imageIndex + 1)
    }

    // Determine where to insert ads (after 2nd, 4th, 6th, 8th, and 10th paragraphs)
    // More ads for better monetization while maintaining readability
    const adPositions = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50, 53, 56, 59, 62, 65, 68, 71, 74, 77, 80]
    
    const processed: Array<{ type: 'html' | 'ad'; content?: string; key: string }> = []
    
    parts.forEach((part, index) => {
      if (part.trim()) {
        const currentPart = part + '</p>'
        const currentHasImage = hasImage(currentPart)
        
        // Check if next paragraph has an image
        const nextPart = index < parts.length - 1 ? parts[index + 1] : ''
        const nextHasImage = hasImage(nextPart)
        
        // Check if this paragraph position is near an image
        const isNearImage = imagePositions.has(index) || imagePositions.has(index + 1)
        
        // Add the paragraph with closing tag
        processed.push({
          type: 'html',
          content: currentPart,
          key: `para-${index}`,
        })
        
        // Insert ad after specified paragraph positions
        // But skip if current or next paragraph contains an image, or if near an image
        if (
          adPositions.includes(index + 1) && 
          index < parts.length - 1 &&
          !currentHasImage &&
          !nextHasImage &&
          !isNearImage
        ) {
          processed.push({
            type: 'ad',
            key: `ad-${index}`,
          })
        }
      }
    })

    return processed
  }, [content])

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
      {processedContent.map((item) => {
        if (item.type === 'html' && item.content) {
          return (
            <div
              key={item.key}
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          )
        }
        if (item.type === 'ad') {
          return (
            <div key={item.key} className="my-8">
              <AdBanner size="rectangle" />
            </div>
          )
        }
        return null
      })}
    </div>
  )
}

