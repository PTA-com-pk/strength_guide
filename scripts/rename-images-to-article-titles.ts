import 'dotenv/config'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import { readdir, stat, rename, readFile } from 'fs/promises'
import { join, basename, dirname, extname } from 'path'
import { existsSync } from 'fs'

function sanitizeFilename(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100) // Limit length
}

async function renameImagesForArticles() {
  try {
    // Create slug -> title mapping from both database and scraped files
    const slugToTitle = new Map<string, string>()
    
    // First, try to load from database
    try {
      console.log('Connecting to database...')
      await connectDB()
      console.log('Fetching all articles from database...')
      const articles = await Article.find({}).select('title slug').lean()
      console.log(`Found ${articles.length} articles in database`)
      articles.forEach((article: any) => {
        slugToTitle.set(article.slug, article.title)
      })
    } catch (dbError: any) {
      console.log(`Database not available: ${dbError.message}`)
      console.log('Will use scraped articles JSON files instead')
    }
    
    // Also load from scraped articles JSON files
    const scrapedDir = join(process.cwd(), 'scraped-articles')
    if (existsSync(scrapedDir)) {
      console.log('Loading articles from scraped JSON files...')
      const files = await readdir(scrapedDir)
      const jsonFiles = files.filter(f => f.endsWith('.json') && f !== 'summary.json')
      
      for (const file of jsonFiles) {
        try {
          const filePath = join(scrapedDir, file)
          const content = await readFile(filePath, 'utf-8')
          const data = JSON.parse(content)
          
          if (data.slug && data.title) {
            // Remove .html from slug if present
            const slug = data.slug.replace(/\.html$/, '')
            slugToTitle.set(slug, data.title)
            
            // Also add without category prefix if it exists
            // e.g., "muscle-building-10-best" -> also map "10-best"
            if (slug.includes('-')) {
              const parts = slug.split('-')
              // Try removing category prefix (first part)
              if (parts.length > 2) {
                const withoutCategory = parts.slice(1).join('-')
                if (!slugToTitle.has(withoutCategory)) {
                  slugToTitle.set(withoutCategory, data.title)
                }
              }
            }
          }
        } catch (error: any) {
          // Skip invalid JSON files
          continue
        }
      }
      console.log(`Loaded ${jsonFiles.length} articles from JSON files`)
    }
    
    console.log(`Total unique articles: ${slugToTitle.size}`)
    
    const imagesDir = join(process.cwd(), 'public', 'images', 'articles')
    
    if (!existsSync(imagesDir)) {
      console.log('Images directory not found:', imagesDir)
      return
    }
    
    console.log(`\nScanning images directory: ${imagesDir}`)
    
    // Process each category folder
    const categoryDirs = await readdir(imagesDir)
    let totalRenamed = 0
    
    for (const categoryDir of categoryDirs) {
      const categoryPath = join(imagesDir, categoryDir)
      const categoryStat = await stat(categoryPath)
      
      if (!categoryStat.isDirectory()) continue
      
      console.log(`\nProcessing category: ${categoryDir}`)
      
      // Process each article folder within category
      const articleDirs = await readdir(categoryPath)
      
      for (const articleDir of articleDirs) {
        const articlePath = join(categoryPath, articleDir)
        const articleStat = await stat(articlePath)
        
        if (!articleStat.isDirectory()) continue
        
        // Try to find matching article by slug
        // The folder name might be the slug, or part of it
        let matchingArticle = null
        let matchingSlug = null
        
        // Remove .html extension if present
        const folderSlug = articleDir.replace(/\.html$/, '')
        
        // Direct match
        if (slugToTitle.has(folderSlug)) {
          matchingSlug = folderSlug
          matchingArticle = slugToTitle.get(folderSlug)!
        } else if (slugToTitle.has(articleDir)) {
          matchingSlug = articleDir
          matchingArticle = slugToTitle.get(articleDir)!
        } else {
          // Try partial matches (folder might have category prefix or vice versa)
          for (const [slug, title] of slugToTitle.entries()) {
            // Check if folder name contains slug or slug contains folder name
            if (folderSlug.includes(slug) || slug.includes(folderSlug)) {
              // Also check for category prefix patterns
              // e.g., folder "10-best" matches slug "muscle-building-10-best"
              const slugParts = slug.split('-')
              const folderParts = folderSlug.split('-')
              
              // Check if folder matches end of slug (category prefix removed)
              if (slugParts.length > folderParts.length) {
                const slugEnd = slugParts.slice(-folderParts.length).join('-')
                if (slugEnd === folderSlug) {
                  matchingSlug = slug
                  matchingArticle = title
                  break
                }
              }
              
              // Check if slug matches end of folder
              if (folderParts.length > slugParts.length) {
                const folderEnd = folderParts.slice(-slugParts.length).join('-')
                if (folderEnd === slug) {
                  matchingSlug = slug
                  matchingArticle = title
                  break
                }
              }
              
              // Simple contains check as fallback
              if (folderSlug.includes(slug) || slug.includes(folderSlug)) {
                matchingSlug = slug
                matchingArticle = title
                break
              }
            }
          }
        }
        
        if (!matchingArticle) {
          console.log(`  ⚠️  No matching article found for folder: ${articleDir}`)
          continue
        }
        
        console.log(`  📁 ${articleDir} -> "${matchingArticle}"`)
        
        // Get all images in this folder
        const files = await readdir(articlePath)
        const imageFiles = files.filter(f => 
          /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
        )
        
        if (imageFiles.length === 0) {
          console.log(`    No images found`)
          continue
        }
        
        // Rename images
        const sanitizedTitle = await sanitizeFilename(matchingArticle)
        
        for (let i = 0; i < imageFiles.length; i++) {
          const oldFile = imageFiles[i]
          const oldPath = join(articlePath, oldFile)
          const ext = extname(oldFile)
          
          // Determine new filename
          let newFilename: string
          
          if (oldFile.toLowerCase() === 'hero.jpg' || 
              oldFile.toLowerCase() === 'hero.png' ||
              oldFile.toLowerCase() === 'hero.jpeg') {
            // Hero image - use article title
            newFilename = `${sanitizedTitle}${ext}`
          } else if (imageFiles.length === 1) {
            // Single image - use article title
            newFilename = `${sanitizedTitle}${ext}`
          } else {
            // Multiple images - append number
            const baseName = oldFile.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')
            // Try to preserve original name if it's descriptive
            if (baseName.length > 3 && baseName !== 'hero' && baseName !== 'image') {
              newFilename = `${sanitizedTitle}-${baseName}${ext}`
            } else {
              newFilename = `${sanitizedTitle}-${i + 1}${ext}`
            }
          }
          
          const newPath = join(articlePath, newFilename)
          
          // Skip if already renamed
          if (oldFile === newFilename) {
            console.log(`    ✓ ${oldFile} (already named correctly)`)
            continue
          }
          
          // Rename file
          try {
            await rename(oldPath, newPath)
            console.log(`    ✓ ${oldFile} -> ${newFilename}`)
            totalRenamed++
          } catch (error: any) {
            console.log(`    ✗ Failed to rename ${oldFile}: ${error.message}`)
          }
        }
      }
    }
    
    console.log(`\n✅ Renaming complete! Total files renamed: ${totalRenamed}`)
    
  } catch (error: any) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

renameImagesForArticles()

