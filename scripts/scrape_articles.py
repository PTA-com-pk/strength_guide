#!/usr/bin/env python3
"""
Scrape articles from muscleandstrength.com
"""
import requests
from bs4 import BeautifulSoup
import os
import json
import time
import re
from urllib.parse import urljoin, urlparse
from pathlib import Path

BASE_URL = 'https://www.muscleandstrength.com'
OUTPUT_DIR = Path(__file__).parent.parent / 'scraped-articles'
IMAGES_DIR = Path(__file__).parent.parent / 'public' / 'images' / 'articles'

# Create directories
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# Session with headers
session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0',
})

def get_existing_slugs():
    """Get slugs of already scraped articles from files and database"""
    existing_slugs = set()
    existing_urls = set()
    
    # Check scraped files
    scraped_dir = Path(__file__).parent.parent / 'scraped-articles'
    if scraped_dir.exists():
        for file in scraped_dir.glob('*.json'):
            if file.name != 'summary.json':
                try:
                    with open(file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        slug = data.get('slug', '').replace('.html', '')
                        url = data.get('url', '')
                        if slug:
                            existing_slugs.add(slug)
                        if url:
                            existing_urls.add(url)
                except:
                    pass
    
    # Check MongoDB database (optional - only if pymongo is available)
    try:
        try:
            from pymongo import MongoClient
            import os
            from dotenv import load_dotenv
            load_dotenv()
            
            mongo_uri = os.getenv('MONGODB_URI')
            if mongo_uri:
                client = MongoClient(mongo_uri)
                db = client.get_database()
                articles_collection = db.get_collection('articles')
                
                # Get existing slugs and URLs from database
                db_slugs = 0
                db_urls = 0
                for article in articles_collection.find({}, {'slug': 1, 'sourceUrl': 1}):
                    if article.get('slug'):
                        slug = article['slug'].replace('.html', '')
                        if slug not in existing_slugs:
                            existing_slugs.add(slug)
                            db_slugs += 1
                    if article.get('sourceUrl'):
                        url = article['sourceUrl']
                        if url not in existing_urls:
                            existing_urls.add(url)
                            db_urls += 1
                
                client.close()
                print(f'  Found {db_slugs} new slugs and {db_urls} new URLs in database')
        except ImportError:
            print('  pymongo not available, skipping database check')
        except Exception as e:
            print(f'  Warning: Could not check database: {e}')
    except Exception as e:
        print(f'  Warning: Database check failed: {e}')
    
    print(f'  Total existing slugs: {len(existing_slugs)}')
    print(f'  Total existing URLs: {len(existing_urls)}')
    return existing_slugs, existing_urls

def get_article_links():
    """Get list of article URLs to scrape"""
    print('Fetching article list...')
    
    # Get existing slugs and URLs to avoid duplicates
    existing_slugs, existing_urls = get_existing_slugs()
    
    article_urls = []
    seen_urls = set()
    
    # Focus on Article categories from MAS_CATEGORIES_CLEAN.md
    # Target these specific article categories:
    article_categories = [
        'muscle-building',      # Muscle Building
        'fat-loss',             # Fat Loss
        'training',              # Training
        'nutrition',             # Nutrition
        'supplements',           # Supplements
        'women',                 # For Women
        'motivation',            # Motivation
        'recovery',              # Recovery
        'sports-performance',    # Sports Performance
        'injury-prevention',     # Injury Prevention
        'fitness-lifestyle',     # Fitness Lifestyle
        'athlete-profiles',      # Athlete Profiles & Interviews
    ]
    
    # Start with main articles page
    pages_to_check = [
        BASE_URL,  # Homepage
        urljoin(BASE_URL, '/articles'),  # Articles page
    ]
    
    # Add each article category page
    for cat in article_categories:
        pages_to_check.append(urljoin(BASE_URL, f'/articles/{cat}'))
    
    # Also check pagination pages (page 2-5) for main articles page and each category
    for page_num in range(2, 6):
        pages_to_check.append(urljoin(BASE_URL, f'/articles?page={page_num}'))
        for cat in article_categories:
            pages_to_check.append(urljoin(BASE_URL, f'/articles/{cat}?page={page_num}'))
    
    for url in pages_to_check:
        try:
            print(f'  Checking: {url}')
            response = session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find article links - focus on /articles/ URLs only (as per user request)
            links = soup.find_all('a', href=re.compile(r'/articles/[^/?#]+'))
            for link in links:
                href = link.get('href')
                if href:
                    # Clean up the URL
                    if href.startswith('/'):
                        full_url = urljoin(BASE_URL, href)
                    elif href.startswith('http'):
                        full_url = href
                    else:
                        continue
                    
                    # Extract slug to check if already scraped
                    slug = full_url.split('/')[-1].replace('.html', '')
                    
                    # Skip if already exists (by slug or URL)
                    if slug in existing_slugs or full_url in existing_urls:
                        continue
                    
                    # Only process /articles/ URLs (focus on article categories)
                    if '/articles/' in full_url and full_url not in seen_urls:
                        # Skip category pages, support pages, and other non-article pages
                        skip_patterns = [
                            '/support.', '/tools/', '/workout-plans/',
                            '/calculators/', '/node/',
                            '?_gl=', '&ajax=', 'page=', '?page='
                        ]
                        if not any(pattern in full_url for pattern in skip_patterns):
                            # Skip known category slugs
                            category_slugs = [
                                'training', 'nutrition', 'workouts', 'supplements',
                                'muscle-building', 'fat-loss', 'women', 'motivation',
                                'lifestyle', 'injury', 'sport', 'recovery', 'interviews',
                                'men', 'abs', 'full-body', 'sports-performance', 'bodyweight',
                                'beginner', 'at-home', 'celebrity', 'cardio', 'chest', 'back',
                                'biceps', 'shoulders', 'legs', 'triceps', 'glutes', 'strength',
                                'protein-shakes', 'protein-bars', 'high-protein', 'low-carb',
                                'snacks', 'vegetarian', 'breakfast', 'lunch', 'dinner', 'bbq-grill',
                                'abductors', 'adductors', 'calves', 'forearms', 'hamstrings',
                                'hip-flexors', 'it-band', 'lats', 'lower-back', 'upper-back',
                                'neck', 'obliques', 'quadriceps', 'traps', 'athlete-profiles',
                                'injury-prevention', 'fitness-lifestyle'
                            ]
                            
                            # Only include if it looks like an actual article (has .html or a slug longer than 8 chars and not a category)
                            if '.html' in full_url or (len(slug) > 8 and slug not in category_slugs):
                                article_urls.append(full_url)
                                seen_urls.add(full_url)
                    
            time.sleep(2)  # Rate limiting
        except Exception as e:
            print(f'  Error fetching {url}: {e}')
            continue
    
    # Remove duplicates
    article_urls = list(dict.fromkeys(article_urls))
    
    # If we don't have enough, add some known article URLs (avoiding duplicates)
    if len(article_urls) < 100:
        fallback_urls = [
            '/articles/how-to-build-muscle',
            '/articles/best-exercises-for-chest',
            '/articles/complete-protein-guide',
            '/articles/bulking-diet-plan',
            '/articles/hypertrophy-training-guide',
            '/articles/calorie-deficit-explained',
            '/articles/best-back-exercises',
            '/articles/creatine-complete-guide',
            '/articles/pre-workout-supplements',
            '/articles/cardio-for-fat-loss',
            '/articles/fat-loss-nutrition-plan',
            '/articles/meal-prep-guide',
            '/articles/beginner-workout-program',
            '/articles/shoulder-exercises',
            '/articles/leg-day-routine',
            '/articles/supplement-buying-guide',
            '/articles/nutrition-basics',
            '/articles/muscle-recovery',
            '/articles/training-frequency',
            '/articles/core-exercises',
        ]
        
        for path in fallback_urls:
            slug = path.split('/')[-1]
            if slug not in existing_slugs:
                full_url = urljoin(BASE_URL, path)
                if full_url not in article_urls and full_url not in existing_urls:
                    article_urls.append(full_url)
                    if len(article_urls) >= 100:
                        break
    
    print(f'Found {len(article_urls)} new articles to scrape\n')
    # Return all articles, not limited to 100
    return article_urls

def download_image(img_url, filepath):
    """Download an image"""
    try:
        if not img_url.startswith('http'):
            img_url = urljoin(BASE_URL, img_url)
        
        response = session.get(img_url, timeout=30, stream=True)
        response.raise_for_status()
        
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        return True
    except Exception as e:
        print(f'    ✗ Failed to download image: {e}')
        return False

def scrape_article(url):
    """Scrape a single article"""
    try:
        print(f'\nScraping: {url}')
        response = session.get(url, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract title
        title_elem = soup.find('h1') or soup.find('title')
        title = title_elem.get_text(strip=True) if title_elem else 'Untitled Article'
        title = title.replace(' | Muscle & Strength', '').strip()
        
        # Extract category from URL path
        category_slug = 'general'
        category_name = 'General'
        
        # Determine category from URL structure
        url_parts = url.replace(BASE_URL, '').strip('/').split('/')
        if len(url_parts) >= 2:
            section = url_parts[0]  # articles, workout-routines, exercises, diet-plans, recipes
            cat_part = url_parts[1].replace('.html', '') if len(url_parts) > 1 else ''
            
            # Map section to category type
            if section == 'articles':
                # Try to find category from page
                category_elem = soup.find('a', href=re.compile(r'/articles/(training|nutrition|supplements|muscle-building|fat-loss|women|motivation|recovery|sports-performance|injury-prevention|fitness-lifestyle|athlete-profiles)'))
                if category_elem:
                    cat_href = category_elem.get('href', '')
                    cat_slug = cat_href.split('/')[-1] if cat_href else cat_part
                    category_name = category_elem.get_text(strip=True) or cat_slug.replace('-', ' ').title()
                    category_slug = cat_slug
                else:
                    # Default to 'Articles' category
                    category_slug = 'articles'
                    category_name = 'Articles'
            elif section == 'workout-routines':
                category_slug = 'workouts'
                category_name = 'Workouts'
            elif section == 'exercises':
                category_slug = 'exercises'
                category_name = 'Exercises'
            elif section == 'diet-plans':
                category_slug = 'diet-plans'
                category_name = 'Diet Plans'
            elif section == 'recipes':
                category_slug = 'recipes'
                category_name = 'Recipes'
        
        # Also try to find category from page content
        if category_slug == 'general':
            category_elem = soup.find('a', href=re.compile(r'/categories/|/category/|/articles/'))
            if category_elem:
                category_href = category_elem.get('href', '')
                if category_href:
                    cat_slug = category_href.split('/')[-1].replace('.html', '')
                    if cat_slug and cat_slug not in ['articles', 'workout-routines', 'exercises', 'diet-plans', 'recipes']:
                        category_slug = cat_slug
                        category_name = category_elem.get_text(strip=True) or cat_slug.replace('-', ' ').title()
        
        # Extract content
        content_elem = (
            soup.find('article') or
            soup.find('div', class_=re.compile(r'article-content|post-content|entry-content')) or
            soup.find('main') or
            soup.find('div', class_='content')
        )
        
        content = ''
        if content_elem:
            # Remove unwanted elements
            for elem in content_elem.find_all(['script', 'style', 'nav', 'header', 'footer']):
                elem.decompose()
            
            # Remove ads
            for elem in content_elem.find_all(class_=re.compile(r'ad|advertisement|social-share')):
                elem.decompose()
            
            content = str(content_elem)
        
        # Extract excerpt
        excerpt = ''
        meta_desc = soup.find('meta', property='og:description') or soup.find('meta', attrs={'name': 'description'})
        if meta_desc:
            excerpt = meta_desc.get('content', '')
        elif content_elem:
            first_p = content_elem.find('p')
            if first_p:
                excerpt = first_p.get_text(strip=True)[:200]
        
        # Extract hero image
        hero_image = ''
        og_image = soup.find('meta', property='og:image')
        if og_image:
            hero_image = og_image.get('content', '')
        else:
            hero_img = soup.find('img', class_=re.compile(r'hero|featured|main'))
            if hero_img:
                hero_image = hero_img.get('src') or hero_img.get('data-src', '')
        
        # Extract all images from content
        images = []
        if content_elem:
            for img in content_elem.find_all('img'):
                src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
                if src and not src.startswith('data:') and 'placeholder' not in src.lower():
                    if not src.startswith('http'):
                        src = urljoin(BASE_URL, src)
                    images.append(src)
        
        # Generate slug from URL
        slug = url.split('/')[-1] or url.split('/')[-2]
        
        return {
            'title': title,
            'slug': slug,
            'categorySlug': category_slug,
            'categoryName': category_name,
            'content': content,
            'excerpt': excerpt,
            'heroImage': hero_image,
            'images': images,
            'url': url,
        }
    except Exception as e:
        print(f'  ✗ Error scraping article: {e}')
        return None

def process_images(article):
    """Download and process images for an article"""
    category_dir = IMAGES_DIR / article['categorySlug']
    article_dir = category_dir / article['slug']
    article_dir.mkdir(parents=True, exist_ok=True)
    
    image_map = {}
    
    # Process hero image
    if article['heroImage']:
        try:
            ext = os.path.splitext(urlparse(article['heroImage']).path)[1] or '.jpg'
            filename = f'hero{ext}'
            filepath = article_dir / filename
            
            if download_image(article['heroImage'], filepath):
                new_path = f"/images/articles/{article['categorySlug']}/{article['slug']}/{filename}"
                image_map[article['heroImage']] = new_path
                article['heroImage'] = new_path
                print(f'  ✓ Downloaded hero image')
        except Exception as e:
            print(f'  ✗ Failed to process hero image: {e}')
    
    # Process content images
    for i, img_url in enumerate(article['images'], 1):
        try:
            ext = os.path.splitext(urlparse(img_url).path)[1] or '.jpg'
            filename = f'image-{i}{ext}'
            filepath = article_dir / filename
            
            if download_image(img_url, filepath):
                new_path = f"/images/articles/{article['categorySlug']}/{article['slug']}/{filename}"
                image_map[img_url] = new_path
                
                # Update content HTML
                article['content'] = article['content'].replace(img_url, new_path)
                print(f'  ✓ Downloaded image {i}/{len(article["images"])}')
                
                time.sleep(0.5)  # Rate limiting
        except Exception as e:
            print(f'  ✗ Failed to process image {i}: {e}')
    
    return image_map

def main():
    print('Starting article scraping...\n')
    
    article_urls = get_article_links()
    scraped_articles = []
    
    for i, url in enumerate(article_urls, 1):
        print(f'\n[{i}/{len(article_urls)}] Processing article...')
        
        article = scrape_article(url)
        if not article:
            continue
        
        # Download images
        print('  Downloading images...')
        process_images(article)
        
        # Save article JSON
        article['scrapedAt'] = time.strftime('%Y-%m-%dT%H:%M:%S')
        
        json_path = OUTPUT_DIR / f"{article['categorySlug']}-{article['slug']}.json"
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(article, f, indent=2, ensure_ascii=False)
        
        scraped_articles.append({
            'title': article['title'],
            'slug': article['slug'],
            'category': article['categoryName'],
            'categorySlug': article['categorySlug'],
        })
        
        print(f'  ✓ Article saved: {article["title"]}')
        
        # Rate limiting between articles
        if i < len(article_urls):
            time.sleep(2)
    
    # Save summary
    summary = {
        'totalArticles': len(scraped_articles),
        'articles': scraped_articles,
        'scrapedAt': time.strftime('%Y-%m-%dT%H:%M:%S'),
    }
    
    summary_path = OUTPUT_DIR / 'summary.json'
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    print(f'\n\n✓ Scraping complete!')
    print(f'  Articles scraped: {len(scraped_articles)}')
    print(f'  Output directory: {OUTPUT_DIR}')
    print(f'  Images directory: {IMAGES_DIR}')

if __name__ == '__main__':
    main()

