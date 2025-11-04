import 'dotenv/config'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Media from '@/models/Media'
import { readFile, readdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { execSync } from 'child_process'

async function checkNewContent() {
  try {
    console.log('🔍 Checking for new content to import...\n')
    
    await connectDB()
    
    // Count articles in database
    const dbArticleCount = await Article.countDocuments({})
    console.log('📊 Database Statistics:')
    console.log(`   Articles in DB: ${dbArticleCount}`)
    
    // Count media in database
    const dbMediaCount = await Media.countDocuments({})
    console.log(`   Media records in DB: ${dbMediaCount}`)
    
    // Count Cloudinary images
    const cloudinaryMediaCount = await Media.countDocuments({
      url: { $regex: 'res.cloudinary.com' }
    })
    console.log(`   Cloudinary images in DB: ${cloudinaryMediaCount}`)
    
    // Get all slugs from database
    const dbArticles = await Article.find({}).select('slug').lean()
    const dbSlugs = new Set(dbArticles.map((a: any) => a.slug))
    
    // Count scraped articles
    const scrapedDir = join(process.cwd(), 'scraped-articles')
    if (existsSync(scrapedDir)) {
      const files = await readdir(scrapedDir)
      const jsonFiles = files.filter(f => f.endsWith('.json') && f !== 'summary.json')
      
      console.log(`\n📁 Scraped Files:`)
      console.log(`   Total scraped articles: ${jsonFiles.length}`)
      
      // Check which ones are new
      let newArticles = 0
      const newArticleSlugs: string[] = []
      
      for (const file of jsonFiles) {
        try {
          const filePath = join(scrapedDir, file)
          const content = await readFile(filePath, 'utf-8')
          const data = JSON.parse(content)
          const slug = (data.slug || '').replace(/\.html$/, '')
          if (slug && !dbSlugs.has(slug)) {
            newArticles++
            newArticleSlugs.push(slug)
          }
        } catch (e) {
          // Skip invalid files
        }
      }
      
      console.log(`   ✅ Already imported: ${jsonFiles.length - newArticles}`)
      console.log(`   🆕 New articles to import: ${newArticles}`)
      
      // Count images in new articles
      let newImagesCount = 0
      if (newArticles > 0) {
        for (const slug of newArticleSlugs.slice(0, 100)) { // Sample first 100
          try {
            const matchingFile = jsonFiles.find(f => f.includes(slug) || f.includes(slug.replace(/-/g, '_')))
            if (matchingFile) {
              const filePath = join(scrapedDir, matchingFile)
              const content = await readFile(filePath, 'utf-8')
              const data = JSON.parse(content)
              // Count images: hero + content images
              if (data.heroImage) newImagesCount++
              if (Array.isArray(data.images)) newImagesCount += data.images.length
            }
          } catch (e) {
            // Skip errors
          }
        }
        // Estimate for all new articles
        const avgImagesPerArticle = newImagesCount / Math.min(newArticles, 100)
        const estimatedNewImages = Math.round(avgImagesPerArticle * newArticles)
        console.log(`   📸 Estimated new images: ~${estimatedNewImages}`)
      }
    }
    
    // Count local images
    try {
      const imageCount = execSync(
        'find public/images/articles -type f \\( -name "*.jpg" -o -name "*.png" -o -name "*.jpeg" -o -name "*.webp" \\) 2>/dev/null | wc -l',
        { encoding: 'utf-8' }
      ).trim()
      console.log(`\n🖼️  Local Images:`)
      console.log(`   Total local images: ${imageCount}`)
      
      // Estimate images not yet uploaded to Cloudinary
      const localImagesNotUploaded = parseInt(imageCount) - cloudinaryMediaCount
      console.log(`   Images not uploaded to Cloudinary: ${Math.max(0, localImagesNotUploaded)}`)
    } catch (e) {
      console.log(`\n🖼️  Could not count local images`)
    }
    
    console.log('\n✅ Check complete!')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

checkNewContent()

