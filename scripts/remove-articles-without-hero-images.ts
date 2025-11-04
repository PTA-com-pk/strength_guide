import 'dotenv/config'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import '@/models/Category'

async function removeArticlesWithoutHeroImages() {
  try {
    console.log('🗑️  Removing articles without hero images...\n')
    
    await connectDB()
    
    // Find articles without hero images
    const articlesToDelete = await Article.find({
      $or: [
        { heroImage: { $exists: false } },
        { heroImage: null },
        { heroImage: '' },
        { heroImage: { $not: { $regex: '\.(jpg|jpeg|png|gif|webp|res\.cloudinary\.com)' } } }
      ]
    }).select('title slug heroImage').lean()
    
    console.log(`Found ${articlesToDelete.length} articles without hero images\n`)
    
    if (articlesToDelete.length === 0) {
      console.log('✅ No articles to remove!')
      process.exit(0)
    }
    
    // Show sample of articles to be deleted
    console.log('📋 Sample articles to be deleted:')
    articlesToDelete.slice(0, 10).forEach((article: any) => {
      console.log(`   - ${article.title} (${article.heroImage || 'no image'})`)
    })
    if (articlesToDelete.length > 10) {
      console.log(`   ... and ${articlesToDelete.length - 10} more`)
    }
    
    // Get article IDs
    const articleIds = articlesToDelete.map((a: any) => a._id)
    
    // Delete articles
    const result = await Article.deleteMany({
      _id: { $in: articleIds }
    })
    
    console.log(`\n✅ Deletion complete!`)
    console.log(`   🗑️  Deleted: ${result.deletedCount} articles`)
    
    // Final count
    const remainingArticles = await Article.countDocuments({})
    console.log(`\n📊 Remaining articles: ${remainingArticles}`)
    
  } catch (error: any) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

removeArticlesWithoutHeroImages()


