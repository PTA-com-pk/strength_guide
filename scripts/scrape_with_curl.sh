#!/bin/bash
# Alternative scraping using curl and manual article URLs

BASE_URL="https://www.muscleandstrength.com"
OUTPUT_DIR="scraped-articles"
IMAGES_DIR="public/images/articles"

mkdir -p "$OUTPUT_DIR"
mkdir -p "$IMAGES_DIR"

# List of article URLs to scrape (you can add more)
ARTICLES=(
    "/articles/push-pull-legs-split"
    "/articles/best-chest-exercises"
    "/articles/protein-intake-guide"
    "/articles/muscle-building-diet"
    "/articles/hypertrophy-training"
    "/articles/calorie-deficit-guide"
    "/articles/best-back-exercises"
    "/articles/creatine-benefits"
    "/articles/pre-workout-guide"
    "/articles/cardio-training"
    "/articles/fat-loss-nutrition"
    "/articles/meal-prep-ideas"
    "/articles/workout-programs"
    "/articles/best-shoulder-exercises"
    "/articles/best-leg-exercises"
    "/articles/supplement-reviews"
    "/articles/nutrition-tips"
    "/articles/recovery-strategies"
    "/articles/training-volume-guide"
    "/articles/best-abs-exercises"
)

echo "Note: This script uses curl. For better results, consider using the Python script with Playwright/Selenium"
echo "for JavaScript-rendered content."

for article in "${ARTICLES[@]}"; do
    echo "Fetching: $article"
    curl -s -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \
         "$BASE_URL$article" > "/tmp/article_$(basename $article).html"
done

echo "Downloaded HTML files to /tmp/"
echo "Use the Python script with Playwright for better results."

