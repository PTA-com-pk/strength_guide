import 'dotenv/config'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Category from '@/models/Category'
import Media from '@/models/Media'
// Import models to ensure they're registered
import '@/models/Category'
import '@/models/Media'
import { readdir, stat, readFile } from 'fs/promises'
import { join, extname, basename, dirname } from 'path'
import { existsSync } from 'fs'
import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  cloudinary.config()
} else if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
} else {
  console.error('❌ Cloudinary credentials not found!')
  console.error('   Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET')
  process.exit(1)
}

function sanitizeForCloudinary(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100) // Limit length
}

function uploadImageToCloudinary(filePath: string, publicId: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        public_id: publicId,
        folder: 'strengthguide/articles',
        overwrite: false,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          // Check if it's a duplicate (resource already exists)
          if (error.http_code === 409 || error.message?.includes('already exists')) {
            // Resource already exists, return the existing URL
            const existingUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud'}/image/upload/${publicId}`
            resolve(existingUrl + '.' + extname(filePath).replace('.', ''))
          } else {
            console.error(`    ✗ Upload error: ${error.message}`)
            resolve(null)
          }
        } else {
          resolve(result?.secure_url || null)
        }
      }
    )
  })
}

async function uploadImagesToCloudinary() {
  try {
    console.log('🚀 Starting Cloudinary image upload...\n')
    
    await connectDB()
    
    // Get all articles with their categories
    console.log('📚 Fetching articles from database...')
    const articles = await Article.find({})
      .populate('categoryId', 'slug name')
      .lean()
    
    console.log(`   Found ${articles.length} articles\n`)
    
    // Create article lookup map by slug
    const articleMap = new Map<string, any>()
    articles.forEach((article: any) => {
      const slug = article.slug.replace(/\.html$/, '')
      articleMap.set(slug, article)
    })
    
    // Create category slug map
    const categorySlugMap = new Map<string, string>()
    articles.forEach((article: any) => {
      if (article.categoryId && typeof article.categoryId === 'object') {
        const slug = article.slug.replace(/\.html$/, '')
        categorySlugMap.set(slug, (article.categoryId as any).slug)
      }
    })
    
    console.log('📂 Scanning images directory...')
    const imagesDir = join(process.cwd(), 'public', 'images', 'articles')
    
    if (!existsSync(imagesDir)) {
      console.error('❌ Images directory not found:', imagesDir)
      process.exit(1)
    }
    
    let totalUploaded = 0
    let totalSkipped = 0
    let totalErrors = 0
    const categoryStats = new Map<string, number>()
    
    // Process each category folder
    const categoryDirs = await readdir(imagesDir)
    
    for (const categoryDir of categoryDirs) {
      const categoryPath = join(imagesDir, categoryDir)
      const categoryStat = await stat(categoryPath)
      
      if (!categoryStat.isDirectory()) continue
      
      console.log(`\n📁 Processing category: ${categoryDir}`)
      
      // Process each article folder
      const articleDirs = await readdir(categoryPath)
      let categoryUploaded = 0
      
      for (const articleDir of articleDirs) {
        const articlePath = join(categoryPath, articleDir)
        const articleStat = await stat(articlePath)
        
        if (!articleStat.isDirectory()) continue
        
        // Find matching article
        let article = articleMap.get(articleDir.replace(/\.html$/, ''))
        
        // Try to find by matching category and slug
        if (!article) {
          for (const [slug, art] of articleMap.entries()) {
            if (articleDir.includes(slug) || slug.includes(articleDir.replace(/\.html$/, ''))) {
              article = art
              break
            }
          }
        }
        
        if (!article) {
          console.log(`  ⚠️  No article found for folder: ${articleDir}`)
          totalSkipped++
          continue
        }
        
        const articleTitle = article.title || 'Untitled Article'
        const articleSlug = sanitizeForCloudinary(articleTitle)
        const categorySlug = (article.categoryId as any)?.slug || categoryDir
        
        // Get all images in this folder
        const files = await readdir(articlePath)
        const imageFiles = files.filter(f => 
          /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
        )
        
        if (imageFiles.length === 0) {
          continue
        }
        
        console.log(`  📄 ${articleTitle.substring(0, 50)}... (${imageFiles.length} images)`)
        
        // Process each image
        for (let i = 0; i < imageFiles.length; i++) {
          const imageFile = imageFiles[i]
          const imagePath = join(articlePath, imageFile)
          const ext = extname(imageFile).replace('.', '')
          
          try {
            // Determine if it's a hero image or content image
            const isHero = imageFile.toLowerCase().includes('hero') || 
                          imageFile.toLowerCase() === articleSlug + '.' + ext ||
                          (i === 0 && imageFiles.length === 1)
            
            // Generate public_id based on article title
            let publicId: string
            if (isHero) {
              publicId = `strengthguide/articles/${articleSlug}`
            } else {
              // For content images, append number or descriptive name
              const baseName = imageFile.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')
              const cleanBaseName = sanitizeForCloudinary(baseName)
              if (cleanBaseName.length > 3 && cleanBaseName !== 'hero' && cleanBaseName !== 'image') {
                publicId = `strengthguide/articles/${articleSlug}-${cleanBaseName}`
              } else {
                publicId = `strengthguide/articles/${articleSlug}-${i + 1}`
              }
            }
            
            // Check if already uploaded to Cloudinary
            const existingMedia = await Media.findOne({
              $or: [
                { url: { $regex: publicId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') } },
                { path: { $regex: publicId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') } },
              ]
            })
            
            if (existingMedia && existingMedia.url?.includes('res.cloudinary.com')) {
              console.log(`    ✓ Already uploaded: ${imageFile}`)
              totalSkipped++
              continue
            }
            
            // Upload to Cloudinary
            console.log(`    ⬆️  Uploading: ${imageFile} -> ${publicId}`)
            const cloudinaryUrl = await uploadImageToCloudinary(imagePath, publicId)
            
            if (!cloudinaryUrl) {
              console.log(`    ✗ Failed to upload: ${imageFile}`)
              totalErrors++
              continue
            }
            
            // Create or update Media record
            // Get a default user ID or create a placeholder
            const mongoose = await import('mongoose')
            const defaultUserId = new mongoose.Types.ObjectId('000000000000000000000000')
            
            const mediaData: any = {
              filename: `${articleSlug}${isHero ? '' : `-${i + 1}`}.${ext}`,
              originalName: imageFile,
              mimeType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
              size: (await stat(imagePath)).size,
              path: cloudinaryUrl,
              url: cloudinaryUrl,
              alt: isHero ? articleTitle : `${articleTitle} - Image ${i + 1}`,
              caption: null,
              uploadedBy: defaultUserId,
            }
            
            let media = existingMedia
            if (!media) {
              media = await Media.create(mediaData)
            } else {
              await Media.updateOne({ _id: media._id }, { $set: mediaData })
            }
            
            // Update article if this is the hero image
            if (isHero && article.heroImage !== cloudinaryUrl) {
              await Article.updateOne(
                { _id: article._id },
                {
                  $set: {
                    heroImage: cloudinaryUrl,
                    heroImageId: media._id,
                  }
                }
              )
              console.log(`    ✓ Updated article hero image`)
            }
            
            totalUploaded++
            categoryUploaded++
            
            // Update category stats
            const catCount = categoryStats.get(categorySlug) || 0
            categoryStats.set(categorySlug, catCount + 1)
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500))
            
          } catch (error: any) {
            console.error(`    ✗ Error processing ${imageFile}: ${error.message}`)
            totalErrors++
          }
        }
        
        // Update category stats (reset at start of each category, accumulate per article)
        // Don't double count - stats are updated per image above
      }
      
      console.log(`   ✓ Category complete: ${categoryUploaded} images uploaded`)
      // Reset for next category
      categoryUploaded = 0
    }
    
    console.log(`\n\n✅ Upload complete!`)
    console.log(`   📤 Uploaded: ${totalUploaded} images`)
    console.log(`   ⏭️  Skipped: ${totalSkipped} images (already uploaded)`)
    console.log(`   ❌ Errors: ${totalErrors} images`)
    
    console.log(`\n📊 Images per category:`)
    for (const [category, count] of categoryStats.entries()) {
      console.log(`   ${category}: ${count} images`)
    }
    
  } catch (error: any) {
    console.error('Fatal error:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

uploadImagesToCloudinary()

