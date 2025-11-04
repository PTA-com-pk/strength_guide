import 'dotenv/config'
import connectDB from '@/lib/mongodb'
import Author from '@/models/Author'
import Category from '@/models/Category'
import Tag from '@/models/Tag'
import Article from '@/models/Article'
import { readFile, readdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Article categories from MAS_CATEGORIES_CLEAN.md
const ARTICLE_CATEGORIES = [
  { name: 'Muscle Building', slug: 'muscle-building' },
  { name: 'Fat Loss', slug: 'fat-loss' },
  { name: 'Training', slug: 'training' },
  { name: 'Nutrition', slug: 'nutrition' },
  { name: 'Supplements', slug: 'supplements' },
  { name: 'For Women', slug: 'for-women' },
  { name: 'Motivation', slug: 'motivation' },
  { name: 'Recovery', slug: 'recovery' },
  { name: 'Sports Performance', slug: 'sports-performance' },
  { name: 'Injury Prevention', slug: 'injury-prevention' },
  { name: 'Fitness Lifestyle', slug: 'fitness-lifestyle' },
  { name: 'Athlete Profiles & Interviews', slug: 'athlete-profiles-interviews' },
]

// Category mapping
const CATEGORY_MAPPING: Record<string, string> = {
  'muscle-building': 'muscle-building',
  'fat-loss': 'fat-loss',
  'training': 'training',
  'nutrition': 'nutrition',
  'supplements': 'supplements',
  'women': 'for-women',
  'for-women': 'for-women',
  'motivation': 'motivation',
  'recovery': 'recovery',
  'sports-performance': 'sports-performance',
  'injury-prevention': 'injury-prevention',
  'fitness-lifestyle': 'fitness-lifestyle',
  'athlete-profiles': 'athlete-profiles-interviews',
  'athlete-profiles-interviews': 'athlete-profiles-interviews',
  'protein.html': 'nutrition',
  'protein': 'nutrition',
  'general': 'training',
  'articles': 'training',
  'workouts': 'training',
}

function mapCategorySlug(oldSlug: string | undefined, title?: string): string {
  // If title is available, try to infer from title first (more accurate)
  if (title) {
    const inferredFromTitle = inferCategoryFromTitle(title)
    // If title inference gives a specific category (not generic "training"), use it
    if (inferredFromTitle !== 'training' || !oldSlug) {
      return inferredFromTitle
    }
  }
  
  if (!oldSlug) {
    return inferCategoryFromTitle(title || '')
  }
  
  const normalized = oldSlug.toLowerCase().replace(/\.html$/, '').trim()
  
  // If old slug is generic (training, general, articles), try title inference
  const genericCategories = ['training', 'general', 'articles', 'workouts']
  if (genericCategories.includes(normalized) && title) {
    const inferred = inferCategoryFromTitle(title)
    if (inferred !== 'training') {
      return inferred
    }
  }
  
  // Direct match
  if (CATEGORY_MAPPING[normalized]) {
    return CATEGORY_MAPPING[normalized]
  }
  
  // Partial match
  for (const [oldKey, newKey] of Object.entries(CATEGORY_MAPPING)) {
    if (normalized.includes(oldKey) || oldKey.includes(normalized)) {
      return newKey
    }
  }
  
  // Try matching against article category slugs
  for (const category of ARTICLE_CATEGORIES) {
    if (normalized.includes(category.slug) || category.slug.includes(normalized)) {
      return category.slug
    }
  }
  
  return 'training' // Default fallback
}

function inferCategoryFromTitle(title: string): string {
  const lowerTitle = title.toLowerCase()
  
  // Check for exact category name matches first (highest priority)
  if (lowerTitle.includes('muscle building') || lowerTitle.includes('muscle-building')) {
    return 'muscle-building'
  }
  if (lowerTitle.includes('fat loss') || lowerTitle.includes('fat-loss')) {
    return 'fat-loss'
  }
  if (lowerTitle.includes("women's") || lowerTitle.includes('for women') || lowerTitle.includes('women fitness')) {
    return 'for-women'
  }
  if (lowerTitle.includes('nutrition') && !lowerTitle.includes('supplement')) {
    return 'nutrition'
  }
  if (lowerTitle.includes('supplement')) {
    return 'supplements'
  }
  if (lowerTitle.includes('motivation')) {
    return 'motivation'
  }
  if (lowerTitle.includes('recovery')) {
    return 'recovery'
  }
  if (lowerTitle.includes('sports performance') || lowerTitle.includes('sport performance')) {
    return 'sports-performance'
  }
  if (lowerTitle.includes('injury prevention') || lowerTitle.includes('injury-prevention')) {
    return 'injury-prevention'
  }
  if (lowerTitle.includes('fitness lifestyle') || lowerTitle.includes('fitness-lifestyle')) {
    return 'fitness-lifestyle'
  }
  if (lowerTitle.includes('athlete profile') || lowerTitle.includes('interview') || lowerTitle.includes('transformation story')) {
    return 'athlete-profiles-interviews'
  }
  if (lowerTitle.includes('diet plan') || lowerTitle.includes('meal plan') || lowerTitle.includes('eating') || lowerTitle.includes('ketogenic') || lowerTitle.includes('iifym') || lowerTitle.includes('carb cycling') || lowerTitle.includes('intermittent fasting')) {
    return 'nutrition'
  }
  if (lowerTitle.includes('training') && !lowerTitle.includes('article')) {
    return 'training'
  }
  
  // Keywords for each category (secondary check)
  const categoryKeywords: Record<string, string[]> = {
    'muscle-building': ['muscle', 'build', 'hypertrophy', 'gains', 'mass', 'size', 'grow', 'bulk'],
    'fat-loss': ['lose weight', 'losing weight', 'weight loss', 'burn fat', 'cut', 'cutting', 'shed'],
    'nutrition': ['diet', 'meal', 'food', 'protein', 'carb', 'calorie', 'eating', 'macros'],
    'supplements': ['protein powder', 'creatine', 'pre workout', 'bcaa', 'vitamin', 'multivitamin'],
    'for-women': ['women', 'woman', 'female', 'ladies', 'mom', 'pregnancy', 'postpartum'],
    'training': ['workout', 'exercise', 'program', 'routine', 'plan', 'schedule'],
    'motivation': ['motivate', 'inspire', 'mindset', 'mental', 'success story'],
    'recovery': ['rest', 'sleep', 'rehab', 'soreness', 'doms', 'rest day'],
    'sports-performance': ['sport', 'athletic', 'performance', 'endurance', 'sprint', 'marathon', 'competition'],
    'injury-prevention': ['injury', 'prevent', 'pain', 'hurt', 'physical therapy', 'physio'],
    'fitness-lifestyle': ['lifestyle', 'life', 'balance', 'wellness', 'healthy living', 'habits'],
    'athlete-profiles-interviews': ['profile', 'interview', 'athlete', 'story', 'feature', 'spotlight'],
  }
  
  // Count matches for each category
  const scores: Record<string, number> = {}
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    scores[category] = 0
    for (const keyword of keywords) {
      if (lowerTitle.includes(keyword)) {
        scores[category]++
      }
    }
  }
  
  // Find category with highest score
  let maxScore = 0
  let bestCategory = 'training' // default
  
  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      bestCategory = category
    }
  }
  
  return bestCategory
}

async function importScrapedArticles() {
  try {
    console.log('🚀 Starting import of scraped articles...\n')
    
    await connectDB()
    
    // Step 1: Ensure all categories exist
    console.log('📁 Ensuring categories exist...')
    const categoryMap = new Map<string, any>()
    
    for (const catData of ARTICLE_CATEGORIES) {
      const category = await Category.findOneAndUpdate(
        { slug: catData.slug },
        {
          name: catData.name,
          slug: catData.slug,
          description: `Articles about ${catData.name.toLowerCase()}`,
        },
        { upsert: true, new: true }
      )
      categoryMap.set(catData.slug, category)
    }
    console.log(`   ✓ ${categoryMap.size} categories ready\n`)
    
    // Step 2: Get or create default author
    console.log('👤 Setting up author...')
    let author = await Author.findOne({ email: 'muscleandstrength@example.com' })
    if (!author) {
      author = await Author.create({
        name: 'Muscle & Strength',
        email: 'muscleandstrength@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MuscleStrength',
        bio: 'Fitness and strength training content from Muscle & Strength',
      })
    }
    console.log(`   ✓ Author ready: ${author.name}\n`)
    
    // Step 3: Get existing articles to avoid duplicates
    console.log('📋 Checking existing articles...')
    const existingArticles = await Article.find().select('slug url').lean()
    const existingSlugs = new Set(existingArticles.map(a => a.slug))
    const existingUrls = new Set(existingArticles.map(a => (a as any).url).filter(Boolean))
    console.log(`   Found ${existingSlugs.size} existing articles\n`)
    
    // Step 4: Read scraped articles
    console.log('📂 Reading scraped articles...')
    const scrapedDir = join(process.cwd(), 'scraped-articles')
    
    if (!existsSync(scrapedDir)) {
      console.error('❌ Scraped articles directory not found!')
      process.exit(1)
    }
    
    const files = (await readdir(scrapedDir)).filter(f => f.endsWith('.json') && f !== 'summary.json')
    console.log(`   Found ${files.length} article files to process\n`)
    
    // Step 5: Import articles
    console.log('📥 Importing articles...\n')
    let imported = 0
    let skipped = 0
    let errors = 0
    const categoryStats = new Map<string, number>()
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const filePath = join(scrapedDir, file)
        const content = await readFile(filePath, 'utf-8')
        const articleData = JSON.parse(content)
        
        // Skip if already exists
        const slug = articleData.slug?.replace(/\.html$/, '') || ''
        const url = articleData.url || ''
        
        if (existingSlugs.has(slug) || (url && existingUrls.has(url))) {
          skipped++
          if (skipped % 50 === 0) {
            process.stdout.write(`   Skipped ${skipped} duplicates...\r`)
          }
          continue
        }
        
        // Determine category
        const categorySlug = mapCategorySlug(articleData.categorySlug, articleData.title)
        const category = categoryMap.get(categorySlug)
        
        if (!category) {
          console.error(`   ⚠️  Category not found for: ${articleData.title} (${categorySlug})`)
          errors++
          continue
        }
        
        // Update hero image path if it's a local path
        let heroImage = articleData.heroImage || ''
        if (heroImage && heroImage.startsWith('/images/articles/')) {
          // Keep as is - it's already a local path
        } else if (heroImage && !heroImage.startsWith('http')) {
          // Convert relative paths to absolute
          heroImage = `/images/articles/${categorySlug}/${slug}/${heroImage.split('/').pop()}`
        }
        
        // Create article
        const article = await Article.create({
          title: articleData.title || 'Untitled Article',
          slug,
          excerpt: articleData.excerpt || articleData.title?.substring(0, 200) || '',
          content: articleData.content || '',
          heroImage: heroImage || undefined,
          publishedAt: articleData.scrapedAt ? new Date(articleData.scrapedAt) : new Date(),
          views: Math.floor(Math.random() * 500), // Random initial views
          authorId: author._id,
          categoryId: category._id,
          tagIds: [], // Tags can be added later if needed
        })
        
        imported++
        const count = categoryStats.get(categorySlug) || 0
        categoryStats.set(categorySlug, count + 1)
        
        // Progress update
        if (imported % 10 === 0) {
          process.stdout.write(`   Imported ${imported}/${files.length} articles...\r`)
        }
        
        // Add to existing sets to avoid duplicates in same batch
        existingSlugs.add(slug)
        if (url) {
          existingUrls.add(url)
        }
        
      } catch (error: any) {
        errors++
        if (errors < 10) { // Only show first 10 errors
          console.error(`\n   ❌ Error importing ${file}: ${error.message}`)
        }
      }
    }
    
    console.log(`\n\n✅ Import complete!`)
    console.log(`   📥 Imported: ${imported} articles`)
    console.log(`   ⏭️  Skipped: ${skipped} articles (duplicates)`)
    console.log(`   ❌ Errors: ${errors} articles`)
    
    console.log(`\n📊 Articles per category:`)
    for (const category of ARTICLE_CATEGORIES) {
      const count = categoryStats.get(category.slug) || 0
      console.log(`   ${category.name}: ${count} articles`)
    }
    
  } catch (error: any) {
    console.error('Fatal error:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

importScrapedArticles()


