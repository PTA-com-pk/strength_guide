import 'dotenv/config'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Media from '@/models/Media'
import '@/models/Category'

async function updateArticlesCloudinaryUrls() {
  try {
    console.log('🔄 Updating articles with Cloudinary URLs...\n')
    
    await connectDB()
    
    // Find articles with local image paths
    const articles = await Article.find({
      heroImage: { 
        $exists: true,
        $not: { $regex: 'res.cloudinary.com' },
        $regex: '^/images/articles'
      }
    }).lean()
    
    console.log(`Found ${articles.length} articles with local image paths\n`)
    
    let updated = 0
    let notFound = 0
    
    for (const article of articles) {
      const heroImage = article.heroImage || ''
      
      // Extract filename from path
      const filename = heroImage.split('/').pop() || ''
      const slug = article.slug.replace(/\.html$/, '')
      
      // Try to find matching Media record by:
      // 1. URL containing article slug/title
      // 2. Filename match
      // 3. Article title in alt/caption
      
      const articleTitleSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      
      // Escape special regex characters
      const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      
      // Search for media with Cloudinary URL matching article
      const media = await Media.findOne({
        url: { $regex: 'res.cloudinary.com' },
        $or: [
          { url: { $regex: escapeRegex(articleTitleSlug) } },
          { filename: { $regex: escapeRegex(filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')) } },
          { alt: { $regex: escapeRegex(article.title.substring(0, 30)), $options: 'i' } },
        ]
      }).lean()
      
      if (media) {
        await Article.updateOne(
          { _id: article._id },
          {
            $set: {
              heroImage: media.url,
              heroImageId: media._id,
            }
          }
        )
        updated++
        if (updated % 10 === 0) {
          console.log(`   Updated ${updated} articles...`)
        }
      } else {
        notFound++
        if (notFound <= 10) {
          console.log(`   ⚠️  No Cloudinary image found for: ${article.title}`)
        }
      }
    }
    
    console.log(`\n✅ Update complete!`)
    console.log(`   ✓ Updated: ${updated} articles`)
    console.log(`   ⚠️  Not found: ${notFound} articles`)
    
    // Final verification
    const articlesWithCloudinary = await Article.countDocuments({
      heroImage: { $regex: 'res.cloudinary.com' }
    })
    const totalArticles = await Article.countDocuments({})
    
    console.log(`\n📊 Final Statistics:`)
    console.log(`   Total articles: ${totalArticles}`)
    console.log(`   Articles with Cloudinary images: ${articlesWithCloudinary}`)
    console.log(`   Coverage: ${((articlesWithCloudinary / totalArticles) * 100).toFixed(1)}%`)
    
  } catch (error: any) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

updateArticlesCloudinaryUrls()

