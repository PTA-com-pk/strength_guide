import 'dotenv/config'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import Article from '@/models/Article'
import { readFile, readdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

// Category mapping from MAS_CATEGORIES_CLEAN.md
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

// Map old category slugs/names to new category slugs
const CATEGORY_MAPPING: Record<string, string> = {
  // Direct matches
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
  
  // Edge cases from scraped data
  'protein.html': 'nutrition', // protein.html usually means nutrition articles
  'protein': 'nutrition',
  'general': 'training',
  'articles': 'training',
  'workouts': 'training',
}

function sanitizeSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
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
  
  // Partial match - check if any category slug contains or is contained in the old slug
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
  
  // HIGH PRIORITY: Exact phrases and specific indicators (check these first)
  
  // Recovery indicators (check before general keywords)
  if (lowerTitle.includes('doms') || lowerTitle.includes('foam rolling') || 
      lowerTitle.includes('soreness') || lowerTitle.includes('recovery') ||
      lowerTitle.includes('rest day') || lowerTitle.includes('sleep')) {
    return 'recovery'
  }
  
  // Fat loss indicators (check before general diet/nutrition)
  if (lowerTitle.includes('fat loss') || lowerTitle.includes('fat-loss') ||
      lowerTitle.includes('lose weight') || lowerTitle.includes('losing weight') ||
      lowerTitle.includes('weight loss') || lowerTitle.includes('burn fat') ||
      lowerTitle.includes('get lean') || lowerTitle.includes('get shredded') ||
      lowerTitle.includes('cutting') || lowerTitle.includes('body fat') ||
      lowerTitle.includes('shredded') || lowerTitle.includes('get ripped')) {
    return 'fat-loss'
  }
  
  // Training methodology and programming (high priority - these are training, not muscle-building)
  if (lowerTitle.includes('training routine') || lowerTitle.includes('training program') ||
      lowerTitle.includes('programming') || lowerTitle.includes('periodisation') ||
      lowerTitle.includes('periodization') || lowerTitle.includes('training split') ||
      lowerTitle.includes('training methodology') || lowerTitle.includes('routine design') ||
      lowerTitle.includes('training plan') && !lowerTitle.includes('muscle')) {
    return 'training'
  }
  
  // Post-workout/recovery articles
  if (lowerTitle.includes('after workout') || lowerTitle.includes('after your workout') ||
      lowerTitle.includes('post-workout') || lowerTitle.includes('finish your workout')) {
    return 'recovery'
  }
  
  // Training/workout indicators (check before muscle-building)
  // Prioritize training for exercise/workout guides unless explicitly about muscle building
  const hasWorkoutKeywords = lowerTitle.includes('workout') || lowerTitle.includes('exercise') ||
      lowerTitle.includes('exercise guide') || lowerTitle.includes('exercise video') ||
      lowerTitle.includes('how to perform') || lowerTitle.includes('video exercise') ||
      (lowerTitle.includes('how to') && (lowerTitle.includes('deadlift') || lowerTitle.includes('squat') || 
       lowerTitle.includes('bench') || lowerTitle.includes('row') || lowerTitle.includes('press') ||
       lowerTitle.includes('pull') || lowerTitle.includes('curl')))
  
  // Strong muscle building indicators (if present, prioritize muscle-building)
  const hasStrongMuscleBuildingKeywords = lowerTitle.includes('muscle building') || 
      lowerTitle.includes('muscle-building') || lowerTitle.includes('build muscle') || 
      lowerTitle.includes('muscle growth') || lowerTitle.includes('muscle mass') ||
      lowerTitle.includes('hypertrophy') || lowerTitle.includes('mass building') ||
      lowerTitle.includes('gains') || lowerTitle.includes('bulk') ||
      lowerTitle.includes('building muscle') || lowerTitle.includes('building') && 
      (lowerTitle.includes('muscle') || lowerTitle.includes('mass') || lowerTitle.includes('size'))
  
  // If it's clearly a workout/exercise guide without strong muscle-building focus, it's training
  if (hasWorkoutKeywords && !hasStrongMuscleBuildingKeywords) {
    return 'training'
  }
  
  // Motivation indicators
  if (lowerTitle.includes('motivation') || lowerTitle.includes('inspire') ||
      lowerTitle.includes('mindset') || lowerTitle.includes('reasons not') ||
      lowerTitle.includes('commitment') || lowerTitle.includes('success story')) {
    return 'motivation'
  }
  
  // Injury prevention
  if (lowerTitle.includes('injury prevention') || lowerTitle.includes('injury-prevention') ||
      lowerTitle.includes('pain-free') || lowerTitle.includes('joint friendly') ||
      lowerTitle.includes('avoid injury')) {
    return 'injury-prevention'
  }
  
  // Sports performance
  if (lowerTitle.includes('sports performance') || lowerTitle.includes('sport performance') ||
      lowerTitle.includes('athletic') || lowerTitle.includes('endurance') ||
      lowerTitle.includes('competition')) {
    return 'sports-performance'
  }
  
  // For women (check before general training)
  if (lowerTitle.includes("women's") || lowerTitle.includes('for women') || 
      lowerTitle.includes('women fitness') || lowerTitle.includes('female') ||
      lowerTitle.includes('ladies') || lowerTitle.includes('mom')) {
    return 'for-women'
  }
  
  // Athlete profiles
  if (lowerTitle.includes('athlete profile') || lowerTitle.includes('interview') || 
      lowerTitle.includes('transformation story') || lowerTitle.includes('body transformation')) {
    return 'athlete-profiles-interviews'
  }
  
  // Nutrition (specific diet plans and meal-related)
  if (lowerTitle.includes('diet plan') || lowerTitle.includes('meal plan') ||
      lowerTitle.includes('ketogenic') || lowerTitle.includes('iifym') ||
      lowerTitle.includes('carb cycling') || lowerTitle.includes('intermittent fasting') ||
      lowerTitle.includes('eating plan') || lowerTitle.includes('nutrition plan') ||
      lowerTitle.includes('recipe') || lowerTitle.includes('meal prep') ||
      lowerTitle.includes('pre-workout meal') || lowerTitle.includes('post-workout meal') ||
      lowerTitle.includes('what to eat') || lowerTitle.includes('foods to')) {
    return 'nutrition'
  }
  
  // Supplements
  if (lowerTitle.includes('supplement') || lowerTitle.includes('protein powder') ||
      lowerTitle.includes('creatine') || lowerTitle.includes('pre workout') ||
      lowerTitle.includes('bcaa') || lowerTitle.includes('multivitamin') ||
      lowerTitle.includes('vitamin') && !lowerTitle.includes('food')) {
    return 'supplements'
  }
  
  // Fitness lifestyle
  if (lowerTitle.includes('fitness lifestyle') || lowerTitle.includes('fitness-lifestyle') ||
      lowerTitle.includes('lifestyle') && (lowerTitle.includes('fitness') || lowerTitle.includes('health'))) {
    return 'fitness-lifestyle'
  }
  
  // Muscle building (specific indicators)
  if (lowerTitle.includes('muscle building') || lowerTitle.includes('muscle-building') ||
      lowerTitle.includes('build muscle') || lowerTitle.includes('muscle growth') ||
      lowerTitle.includes('muscle mass') || lowerTitle.includes('hypertrophy') ||
      lowerTitle.includes('bulk') || lowerTitle.includes('gains') ||
      lowerTitle.includes('mass building') || lowerTitle.includes('size')) {
    return 'muscle-building'
  }
  
  // SECONDARY: Keyword scoring (more nuanced)
  const categoryKeywords: Record<string, { keywords: string[], weight: number }> = {
    'fat-loss': {
      keywords: ['cut', 'shed', 'lean', 'leaner', 'body fat', 'fat burning', 'weight loss'],
      weight: 2
    },
    'nutrition': {
      keywords: ['diet', 'meal', 'food', 'eating', 'calorie', 'macros', 'protein intake', 'nutrition'],
      weight: 1
    },
    'training': {
      keywords: ['workout', 'exercise', 'program', 'routine', 'training', 'plan', 'schedule', 
                 'exercise guide', 'training split', 'workout program', 'training routine'],
      weight: 2
    },
    'recovery': {
      keywords: ['rest', 'sleep', 'rehab', 'recovery', 'rest day'],
      weight: 2
    },
    'motivation': {
      keywords: ['motivate', 'inspire', 'mindset', 'mental', 'commitment'],
      weight: 2
    },
    'muscle-building': {
      keywords: ['muscle', 'build', 'hypertrophy', 'gains', 'mass', 'size', 'grow', 'bulk', 'muscle building'],
      weight: 1
    },
    'supplements': {
      keywords: ['supplement', 'creatine', 'vitamin', 'supplementation'],
      weight: 2
    },
  }
  
  // Score each category
  const scores: Record<string, number> = {}
  
  for (const [category, config] of Object.entries(categoryKeywords)) {
    scores[category] = 0
    for (const keyword of config.keywords) {
      if (lowerTitle.includes(keyword)) {
        scores[category] += config.weight
      }
    }
  }
  
  // Find category with highest score, but require minimum score of 2
  let maxScore = 0
  let bestCategory = 'training' // default fallback
  
  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore && score >= 2) {
      maxScore = score
      bestCategory = category
    }
  }
  
  // If no category scored high enough, check for exercise/training keywords
  if (maxScore < 2) {
    if (lowerTitle.includes('exercise') || lowerTitle.includes('workout') || 
        lowerTitle.includes('training') || lowerTitle.includes('routine') ||
        lowerTitle.includes('program') || lowerTitle.includes('plan') && !lowerTitle.includes('diet') && !lowerTitle.includes('meal')) {
      return 'training'
    }
    // If it has muscle-related keywords but not strong enough, still categorize as muscle-building
    if (lowerTitle.includes('muscle') || lowerTitle.includes('build') || 
        lowerTitle.includes('mass') || lowerTitle.includes('gains')) {
      return 'muscle-building'
    }
    // Default to training for generic fitness content
    return 'training'
  }
  
  return bestCategory
}

async function recategorizeArticles() {
  try {
    console.log('Connecting to database...')
    await connectDB()
    
    // Step 1: Create/update all article categories
    console.log('\n📁 Creating/updating categories...')
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
      console.log(`  ✓ ${catData.name} (${catData.slug})`)
    }
    
    console.log(`\nCreated/updated ${categoryMap.size} categories`)
    
    // Step 2: Load category mapping from scraped JSON files
    console.log('\n📂 Loading category data from scraped articles...')
    const slugToCategorySlug = new Map<string, string>()
    const scrapedDir = join(process.cwd(), 'scraped-articles')
    
    if (existsSync(scrapedDir)) {
      const files = await readdir(scrapedDir)
      const jsonFiles = files.filter(f => f.endsWith('.json') && f !== 'summary.json')
      
      for (const file of jsonFiles) {
        try {
          const filePath = join(scrapedDir, file)
          const content = await readFile(filePath, 'utf-8')
          const data = JSON.parse(content)
          
          if (data.slug && data.categorySlug) {
            const slug = data.slug.replace(/\.html$/, '')
            slugToCategorySlug.set(slug, data.categorySlug)
          }
        } catch (error: any) {
          // Skip invalid JSON files
          continue
        }
      }
      console.log(`  Loaded category data for ${slugToCategorySlug.size} articles from JSON files`)
    }
    
    // Step 3: Get all articles
    console.log('\n📄 Fetching articles from database...')
    const articles = await Article.find({}).lean()
    console.log(`Found ${articles.length} articles`)
    
    // Step 4: Update articles with correct categories
    console.log('\n🔄 Recategorizing articles...')
    let updated = 0
    let skipped = 0
    const categoryStats = new Map<string, number>()
    
    for (const article of articles) {
      let oldCategorySlug = ''
      
      // First, try to get from scraped JSON files (most accurate)
      if (slugToCategorySlug.has(article.slug)) {
        oldCategorySlug = slugToCategorySlug.get(article.slug)!
      } else {
        // Try to get category from article's categoryId
        // Check if categoryId is populated (object with slug) or just ObjectId
        if (article.categoryId && typeof article.categoryId === 'object' && 'slug' in article.categoryId) {
          oldCategorySlug = (article.categoryId as any).slug
        } else {
          // Try to find the category from database
          const oldCategory = await Category.findById(article.categoryId).lean()
          if (oldCategory) {
            oldCategorySlug = oldCategory.slug
          }
        }
      }
      
      // Map to new category slug (pass title for better inference)
      const newCategorySlug = mapCategorySlug(oldCategorySlug, article.title)
      const newCategory = categoryMap.get(newCategorySlug)
      
      if (!newCategory) {
        console.log(`  ⚠️  Article "${article.title}" - category not found: ${newCategorySlug} (from: ${oldCategorySlug})`)
        skipped++
        continue
      }
      
      // Debug output for first few articles
      if (updated < 10) {
        console.log(`  📝 "${article.title.substring(0, 50)}..."`)
        console.log(`     Old slug: ${oldCategorySlug || 'none'} -> New: ${newCategorySlug}`)
      }
      
      // Update article if category changed
      if (article.categoryId?.toString() !== newCategory._id.toString()) {
        await Article.updateOne(
          { _id: article._id },
          { $set: { categoryId: newCategory._id } }
        )
        
        const count = categoryStats.get(newCategorySlug) || 0
        categoryStats.set(newCategorySlug, count + 1)
        
        updated++
        if (updated % 10 === 0) {
          console.log(`  Updated ${updated} articles...`)
        }
      } else {
        const count = categoryStats.get(newCategorySlug) || 0
        categoryStats.set(newCategorySlug, count + 1)
      }
    }
    
    console.log(`\n✅ Recategorization complete!`)
    console.log(`   Updated: ${updated} articles`)
    console.log(`   Already correct: ${articles.length - updated - skipped} articles`)
    console.log(`   Skipped: ${skipped} articles`)
    
    console.log(`\n📊 Articles per category:`)
    for (const category of ARTICLE_CATEGORIES) {
      const count = categoryStats.get(category.slug) || 0
      console.log(`   ${category.name}: ${count} articles`)
    }
    
  } catch (error: any) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

recategorizeArticles()

