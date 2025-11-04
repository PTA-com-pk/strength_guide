import 'dotenv/config'
import connectDB from '@/lib/mongodb'
import Article from '@/models/Article'
import Media from '@/models/Media'
import '@/models/Category'

async function verifyCloudinaryUploads() {
  try {
    console.log('🔍 Verifying Cloudinary uploads...\n')
    
    await connectDB()
    
    // Count articles with Cloudinary images
    const articlesWithCloudinary = await Article.countDocuments({
      heroImage: { $regex: 'res.cloudinary.com' }
    })
    
    const totalArticles = await Article.countDocuments({})
    
    // Count media records with Cloudinary URLs
    const mediaWithCloudinary = await Article.countDocuments({
      heroImage: { $regex: 'res.cloudinary.com' }
    })
    
    const totalMedia = await Media.countDocuments({
      url: { $regex: 'res.cloudinary.com' }
    })
    
    // Get articles without Cloudinary images
    const articlesWithoutCloudinary = await Article.find({
      heroImage: { $exists: true, $not: { $regex: 'res.cloudinary.com' } }
    }).select('title slug heroImage').limit(10).lean()
    
    console.log('📊 Upload Statistics:')
    console.log(`   Total articles: ${totalArticles}`)
    console.log(`   Articles with Cloudinary images: ${articlesWithCloudinary}`)
    console.log(`   Articles without Cloudinary images: ${totalArticles - articlesWithCloudinary}`)
    console.log(`   Media records with Cloudinary URLs: ${totalMedia}`)
    
    if (articlesWithoutCloudinary.length > 0) {
      console.log(`\n⚠️  Sample articles without Cloudinary images:`)
      articlesWithoutCloudinary.forEach((article: any) => {
        console.log(`   - ${article.title} (${article.heroImage || 'no image'})`)
      })
    }
    
    // Count by category
    const categoryStats = await Article.aggregate([
      {
        $match: {
          heroImage: { $regex: 'res.cloudinary.com' }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $group: {
          _id: '$category.slug',
          name: { $first: '$category.name' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ])
    
    console.log(`\n📊 Articles with Cloudinary images by category:`)
    categoryStats.forEach((stat: any) => {
      console.log(`   ${stat.name}: ${stat.count} articles`)
    })
    
  } catch (error: any) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

verifyCloudinaryUploads()


