import 'dotenv/config'
import connectDB from './mongodb'
import Author from '@/models/Author'
import Category from '@/models/Category'
import Tag from '@/models/Tag'
import Article from '@/models/Article'
import fs from 'fs'
import path from 'path'

// Category mapping from scraped data to database categories
const categoryMapping: Record<string, string> = {
  'training': 'training',
  'nutrition': 'nutrition',
  'workouts': 'workouts',
  'supplements': 'supplements',
  'muscle-building': 'muscle-building',
  'fat-loss': 'fat-loss',
  'women': 'training', // Map women articles to training (or could create separate category)
  'motivation': 'training',
  'lifestyle': 'training',
  'injury': 'training',
  'sport': 'training',
  'recovery': 'training',
  'interviews': 'training',
  'protein.html': 'nutrition', // Map protein to nutrition
  'general': 'training', // Default fallback
}

// Category detection based on content keywords (order matters - check specific first)
function detectCategory(title: string, content: string, excerpt: string, scrapedCategory?: string): string {
  const text = `${title} ${excerpt} ${content}`.toLowerCase()
  
  // Check scraped category first for specific mappings
  if (scrapedCategory) {
    const normalized = scrapedCategory.toLowerCase().replace('.html', '')
    if (normalized === 'women' && (text.includes('women') || text.includes('female') || text.includes('woman'))) {
      return 'training' // Map women articles to training category
    }
    if (normalized === 'nutrition' || normalized.includes('diet') || normalized.includes('recipe')) {
      return 'nutrition'
    }
  }
  
  // Recipe and diet plan keywords (check before general nutrition)
  if (text.match(/\b(recipe|recipes|diet plan|meal prep|clean eating|keto|paleo|intermittent fasting|meal plan|protein shake|protein bar)\b/)) {
    return 'nutrition'
  }
  
  // Fat loss keywords (check first as it's specific)
  if (text.match(/\b(fat loss|shredded|body fat|10 percent|lean|cutting|body fat percentage)\b/)) {
    return 'fat-loss'
  }
  
  // Supplements keywords (check before general nutrition)
  if (text.match(/\b(supplement|collagen|eaa|pre-workout|creatine|protein powder|amino acid|supplementation)\b/)) {
    return 'supplements'
  }
  
  // Muscle building keywords
  if (text.match(/\b(muscle building|muscle mass|bulk|muscle building split|hypertrophy|size gains)\b/)) {
    return 'muscle-building'
  }
  
  // Workout keywords (specific workout routines)
  if (text.match(/\b(workout routine|exercise routine|full body workout|squat rack|barbell workout|cardio|zone 2|rest day workout)\b/)) {
    return 'workouts'
  }
  
  // Nutrition keywords (diet, meal planning)
  if (text.match(/\b(diet|meal|nutrition|food|eating|calorie|macro|bodybuilding diet|bulk diet|meal plan)\b/)) {
    return 'nutrition'
  }
  
  // Training keywords (general training advice)
  if (text.match(/\b(training|bodybuilding|workout|exercise|gains|recovery|years of training|lessons)\b/)) {
    return 'training'
  }
  
  return 'training' // Default fallback
}

// Tag extraction keywords
const tagKeywords: Record<string, string[]> = {
  'beginner': ['beginner', 'beginners', 'starting', 'intro', 'basics'],
  'advanced': ['advanced', 'expert', 'elite', 'professional'],
  'home-workout': ['home', 'home workout', 'bodyweight', 'no equipment'],
  'gym': ['gym', 'weights', 'barbell', 'dumbbell', 'equipment'],
  'protein': ['protein', 'amino', 'supplement'],
  'cardio': ['cardio', 'cardiorespiratory', 'running', 'cycling'],
  'strength': ['strength', 'power', 'strong', 'lifting'],
  'hypertrophy': ['hypertrophy', 'muscle building', 'size', 'mass'],
  'diet': ['diet', 'nutrition', 'meal', 'eating', 'food'],
  'recovery': ['recovery', 'rest', 'sleep', 'rehab'],
}

async function extractTags(title: string, content: string, excerpt: string): Promise<string[]> {
  const text = `${title} ${excerpt} ${content}`.toLowerCase()
  const foundTags: string[] = []

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      foundTags.push(tag)
    }
  }

  return foundTags
}

function cleanSlug(slug: string): string {
  // Remove .html extension and clean up
  let cleaned = slug.replace(/\.html$/, '').replace(/[^a-z0-9-]/gi, '-').toLowerCase()
  
  // Remove multiple consecutive dashes
  cleaned = cleaned.replace(/-+/g, '-')
  
  // Remove leading/trailing dashes
  cleaned = cleaned.replace(/^-+|-+$/g, '')
  
  return cleaned
}

function mapCategory(scrapedCategory: string): string {
  // Normalize the category slug
  const normalized = scrapedCategory.toLowerCase().replace('.html', '')
  return categoryMapping[normalized] || categoryMapping['general']
}

async function main() {
  console.log('Starting seed of scraped articles...\n')

  await connectDB()

  // Get or create authors
  let author1 = await Author.findOne({ email: 'john.doe@example.com' })
  if (!author1) {
    author1 = await Author.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      bio: 'Certified personal trainer with 10+ years of experience in strength training and nutrition.',
    })
  }

  let author2 = await Author.findOne({ email: 'jane.smith@example.com' })
  if (!author2) {
    author2 = await Author.create({
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      bio: 'Nutritionist and fitness coach specializing in weight loss and body composition.',
    })
  }

  // Ensure all categories exist
  const categories = await Category.find()
  const categoryMap = new Map<string, any>()
  categories.forEach(cat => {
    categoryMap.set(cat.slug, cat)
  })

  // Ensure all tags exist
  const tags = await Tag.find()
  const tagMap = new Map<string, any>()
  tags.forEach(tag => {
    tagMap.set(tag.slug, tag)
  })

  // Read scraped articles
  const scrapedDir = path.join(process.cwd(), 'scraped-articles')
  const files = fs.readdirSync(scrapedDir).filter(f => f.endsWith('.json') && f !== 'summary.json')
  
  // Get existing slugs from database to avoid duplicates
  const existingArticles = await Article.find().select('slug').lean()
  const existingSlugs = new Set(existingArticles.map(a => a.slug))
  console.log(`Found ${existingSlugs.size} existing articles in database\n`)

  console.log(`Found ${files.length} scraped article files\n`)

  let imported = 0
  let skipped = 0
  let errors = 0

  for (const file of files) {
    try {
      const filePath = path.join(scrapedDir, file)
      const articleData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

      // Skip category pages (they don't have proper content)
      // But allow actual articles from these categories
      const categoryPageSlugs = ['training', 'nutrition', 'workouts', 'supplements', 'muscle-building', 'fat-loss', 'women', 'motivation', 'lifestyle', 'injury', 'sport', 'recovery', 'interviews']
      const isCategoryPage = 
        (articleData.title.toLowerCase().includes('articles') && articleData.title.toLowerCase().endsWith('articles')) ||
        !articleData.content ||
        articleData.content.length < 300 ||
        (articleData.slug === articleData.categorySlug && categoryPageSlugs.includes(articleData.slug.toLowerCase()))
      
      if (isCategoryPage) {
        console.log(`⏭️  Skipping: ${articleData.title} (category page or insufficient content)`)
        skipped++
        continue
      }

      // Clean and validate slug
      const slug = cleanSlug(articleData.slug)
      if (!slug || slug.length < 3) {
        console.log(`⏭️  Skipping: ${articleData.title} (invalid slug)`)
        skipped++
        continue
      }

      // Check if article already exists (both in DB and scraped files)
      if (existingSlugs.has(slug)) {
        console.log(`⏭️  Skipping: ${articleData.title} (duplicate slug: ${slug})`)
        skipped++
        continue
      }

      // Detect category from content (more accurate than scraped category)
      const detectedCategory = detectCategory(
        articleData.title,
        articleData.content || '',
        articleData.excerpt || '',
        articleData.categorySlug
      )
      // Use detected category, but fallback to mapped category if detection fails
      const categorySlug = detectedCategory || mapCategory(articleData.categorySlug || 'general')
      let category = categoryMap.get(categorySlug)
      
      if (!category) {
        // Create category if it doesn't exist
        category = await Category.create({
          name: articleData.categoryName || 'General',
          slug: categorySlug,
          description: `Articles about ${categorySlug}`,
        })
        categoryMap.set(categorySlug, category)
      }

      // Extract and create tags
      const tagSlugs = await extractTags(
        articleData.title,
        articleData.content || '',
        articleData.excerpt || ''
      )
      
      const tagIds = []
      for (const tagSlug of tagSlugs.slice(0, 5)) { // Limit to 5 tags
        let tag = tagMap.get(tagSlug)
        if (!tag) {
          tag = await Tag.create({
            name: tagSlug.charAt(0).toUpperCase() + tagSlug.slice(1).replace(/-/g, ' '),
            slug: tagSlug,
          })
          tagMap.set(tagSlug, tag)
        }
        tagIds.push(tag._id)
      }

      // Assign author (alternate between authors)
      const author = Math.random() > 0.5 ? author1 : author2

      // Create article
      const article = await Article.create({
        title: articleData.title,
        slug,
        excerpt: articleData.excerpt || articleData.title,
        content: articleData.content || '',
        heroImage: articleData.heroImage || undefined,
        publishedAt: new Date(),
        views: Math.floor(Math.random() * 1000), // Random views for variety
        authorId: author._id,
        categoryId: category._id,
        tagIds,
      })

      imported++
      console.log(`✅ Imported: ${article.title} (${categorySlug})`)
    } catch (error: any) {
      errors++
      console.error(`❌ Error importing ${file}:`, error.message)
    }
  }

  console.log(`\n\n✨ Seed complete!`)
  console.log(`   ✅ Imported: ${imported} articles`)
  console.log(`   ⏭️  Skipped: ${skipped} articles`)
  console.log(`   ❌ Errors: ${errors} articles`)

  process.exit(0)
}

main().catch(console.error)

