const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const { parse } = require('node-html-parser')

// Configuration
const BASE_URL = 'https://www.muscleandstrength.com'
const OUTPUT_DIR = path.join(__dirname, '../scraped-articles')
const IMAGES_DIR = path.join(__dirname, '../public/images/articles')

// Create directories
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true })
}

// Utility function to fetch URL
function fetchURL(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const client = urlObj.protocol === 'https:' ? https : http
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    }

    const req = client.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302) {
          resolve(data)
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${url}`))
        }
      })
    })

    req.on('error', reject)
    req.setTimeout(30000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
    req.end()
  })
}

// Download image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url.startsWith('http') ? url : BASE_URL + url)
    const client = urlObj.protocol === 'https:' ? https : http
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    }

    const req = client.request(options, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath)
        res.pipe(fileStream)
        fileStream.on('finish', () => {
          fileStream.close()
          resolve(filepath)
        })
        fileStream.on('error', reject)
      } else {
        reject(new Error(`Failed to download image: ${res.statusCode}`))
      }
    })

    req.on('error', reject)
    req.setTimeout(30000, () => {
      req.destroy()
      reject(new Error('Image download timeout'))
    })
    req.end()
  })
}

// Extract article links from homepage/articles page
async function getArticleLinks() {
  try {
    console.log('Fetching article list...')
    const html = await fetchURL(`${BASE_URL}/articles`)
    const root = parse(html)
    
    const links = []
    // Look for article links - adjust selectors based on actual HTML structure
    const articleElements = root.querySelectorAll('a[href*="/articles/"]')
    
    for (const elem of articleElements) {
      const href = elem.getAttribute('href')
      if (href && href.includes('/articles/') && !href.includes('#') && !links.includes(href)) {
        const fullUrl = href.startsWith('http') ? href : BASE_URL + href
        links.push(fullUrl)
      }
    }
    
    return [...new Set(links)].slice(0, 20) // Get unique links, limit to 20
  } catch (error) {
    console.error('Error fetching article links:', error.message)
    // Fallback: use some known article URLs
    return [
      `${BASE_URL}/articles/push-pull-legs-split`,
      `${BASE_URL}/articles/best-chest-exercises`,
      `${BASE_URL}/articles/protein-intake-guide`,
      `${BASE_URL}/articles/muscle-building-diet`,
      `${BASE_URL}/articles/hypertrophy-training`,
    ].slice(0, 20)
  }
}

// Scrape single article
async function scrapeArticle(url) {
  try {
    console.log(`\nScraping: ${url}`)
    const html = await fetchURL(url)
    const root = parse(html)
    
    // Extract article data
    const title = root.querySelector('h1')?.text?.trim() || 
                  root.querySelector('title')?.text?.trim() || 
                  'Untitled Article'
    
    // Extract category
    const categoryLink = root.querySelector('a[href*="/categories/"]') || 
                         root.querySelector('a[href*="/category/"]')
    const categorySlug = categoryLink?.getAttribute('href')?.split('/').pop() || 'general'
    const categoryName = categoryLink?.text?.trim() || 'General'
    
    // Extract content
    const contentElem = root.querySelector('article') || 
                        root.querySelector('.article-content') ||
                        root.querySelector('.post-content') ||
                        root.querySelector('main')
    
    let content = ''
    if (contentElem) {
      // Remove scripts and styles
      contentElem.querySelectorAll('script, style, .ad, .advertisement, .social-share').forEach(el => el.remove())
      content = contentElem.innerHTML
    }
    
    // Extract excerpt
    const excerpt = root.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                    root.querySelector('meta[name="description"]')?.getAttribute('content') ||
                    contentElem?.querySelector('p')?.text?.trim()?.substring(0, 200) ||
                    ''
    
    // Extract hero image
    const heroImage = root.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                      root.querySelector('img.hero')?.getAttribute('src') ||
                      root.querySelector('article img')?.getAttribute('src') ||
                      ''
    
    // Extract all images from content
    const images = []
    if (contentElem) {
      const imgElements = contentElem.querySelectorAll('img')
      for (const img of imgElements) {
        const src = img.getAttribute('src') || img.getAttribute('data-src')
        if (src && !src.includes('data:image') && !src.includes('placeholder')) {
          images.push(src)
        }
      }
    }
    
    // Generate slug from URL
    const slug = url.split('/').pop() || url.split('/').slice(-2).join('-')
    
    return {
      title,
      slug,
      categorySlug,
      categoryName,
      content,
      excerpt,
      heroImage,
      images,
      url,
    }
  } catch (error) {
    console.error(`Error scraping article ${url}:`, error.message)
    return null
  }
}

// Download and process images
async function processImages(article, articleDir) {
  const imageMap = {}
  
  // Process hero image
  if (article.heroImage) {
    try {
      const imageUrl = article.heroImage.startsWith('http') ? article.heroImage : BASE_URL + article.heroImage
      const ext = path.extname(new URL(imageUrl).pathname) || '.jpg'
      const filename = `hero${ext}`
      const filepath = path.join(articleDir, filename)
      
      await downloadImage(imageUrl, filepath)
      imageMap[article.heroImage] = `/images/articles/${article.categorySlug}/${article.slug}/${filename}`
      console.log(`  ✓ Downloaded hero image`)
    } catch (error) {
      console.log(`  ✗ Failed to download hero image: ${error.message}`)
    }
  }
  
  // Process content images
  for (let i = 0; i < article.images.length; i++) {
    const imgUrl = article.images[i]
    try {
      const imageUrl = imgUrl.startsWith('http') ? imgUrl : BASE_URL + imgUrl
      const ext = path.extname(new URL(imageUrl).pathname) || '.jpg'
      const filename = `image-${i + 1}${ext}`
      const filepath = path.join(articleDir, filename)
      
      await downloadImage(imageUrl, filepath)
      const newPath = `/images/articles/${article.categorySlug}/${article.slug}/${filename}`
      imageMap[imgUrl] = newPath
      
      // Update content HTML
      article.content = article.content.replace(
        new RegExp(imgUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        newPath
      )
      
      console.log(`  ✓ Downloaded image ${i + 1}/${article.images.length}`)
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.log(`  ✗ Failed to download image ${i + 1}: ${error.message}`)
    }
  }
  
  return imageMap
}

// Main scraping function
async function main() {
  console.log('Starting article scraping...\n')
  
  const articleLinks = await getArticleLinks()
  console.log(`Found ${articleLinks.length} articles to scrape\n`)
  
  const scrapedArticles = []
  
  for (let i = 0; i < articleLinks.length; i++) {
    const url = articleLinks[i]
    console.log(`\n[${i + 1}/${articleLinks.length}] Processing article...`)
    
    const article = await scrapeArticle(url)
    if (!article) {
      console.log('  ✗ Failed to scrape article')
      continue
    }
    
    // Create category and article directories
    const categoryDir = path.join(IMAGES_DIR, article.categorySlug)
    const articleDir = path.join(categoryDir, article.slug)
    
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true })
    }
    if (!fs.existsSync(articleDir)) {
      fs.mkdirSync(articleDir, { recursive: true })
    }
    
    // Download images
    console.log('  Downloading images...')
    await processImages(article, articleDir)
    
    // Save article JSON
    const articleData = {
      ...article,
      scrapedAt: new Date().toISOString(),
    }
    
    const jsonPath = path.join(OUTPUT_DIR, `${article.categorySlug}-${article.slug}.json`)
    fs.writeFileSync(jsonPath, JSON.stringify(articleData, null, 2))
    
    scrapedArticles.push(articleData)
    console.log(`  ✓ Article saved: ${article.title}`)
    
    // Rate limiting between articles
    if (i < articleLinks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  // Save summary
  const summaryPath = path.join(OUTPUT_DIR, 'summary.json')
  fs.writeFileSync(summaryPath, JSON.stringify({
    totalArticles: scrapedArticles.length,
    articles: scrapedArticles.map(a => ({
      title: a.title,
      slug: a.slug,
      category: a.categoryName,
      categorySlug: a.categorySlug,
    })),
    scrapedAt: new Date().toISOString(),
  }, null, 2))
  
  console.log(`\n\n✓ Scraping complete!`)
  console.log(`  Articles scraped: ${scrapedArticles.length}`)
  console.log(`  Output directory: ${OUTPUT_DIR}`)
  console.log(`  Images directory: ${IMAGES_DIR}`)
}

// Run scraper
main().catch(console.error)

