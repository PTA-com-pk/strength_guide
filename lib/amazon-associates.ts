/**
 * Amazon Associates (Product Advertising API 5.0) Integration
 * 
 * This module provides utilities for searching and importing Amazon products
 * using the Amazon Product Advertising API 5.0.
 */

// @ts-ignore - paapi5-nodejs-sdk doesn't have TypeScript types
import {
  DefaultApi,
  SearchItemsRequest,
  GetItemsRequest,
  PartnerType,
  ItemCondition,
  Resources,
  SearchIndex,
} from 'paapi5-nodejs-sdk'

// Amazon Associates configuration
const AMAZON_ACCESS_KEY = process.env.AMAZON_ACCESS_KEY || ''
const AMAZON_SECRET_KEY = process.env.AMAZON_SECRET_KEY || ''
const AMAZON_PARTNER_TAG = process.env.AMAZON_PARTNER_TAG || ''
const AMAZON_HOST = process.env.AMAZON_HOST || 'webservices.amazon.com'
const AMAZON_REGION = process.env.AMAZON_REGION || 'us-east-1'

/**
 * Initialize Amazon PA-API client
 */
function getAmazonClient() {
  const defaultApi = new DefaultApi()
  
  defaultApi.setAccessKey(AMAZON_ACCESS_KEY)
  defaultApi.setSecretKey(AMAZON_SECRET_KEY)
  defaultApi.setHost(AMAZON_HOST)
  defaultApi.setRegion(AMAZON_REGION)
  
  return defaultApi
}

/**
 * Search Amazon products
 */
export async function searchAmazonProducts(params: {
  keywords: string
  searchIndex?: SearchIndex
  itemCount?: number
  minPrice?: number
  maxPrice?: number
  category?: string
}) {
  try {
    const defaultApi = getAmazonClient()
    
    // Map category to Amazon SearchIndex
    const searchIndexMap: Record<string, SearchIndex> = {
      supplements: SearchIndex.HEALTH,
      equipment: SearchIndex.SPORTS,
      apparel: SearchIndex.APPAREL,
      accessories: SearchIndex.SPORTS,
    }
    
    const searchIndex = params.searchIndex || 
      (params.category ? searchIndexMap[params.category] : SearchIndex.ALL)
    
    const searchItemsRequest: SearchItemsRequest = {
      PartnerTag: AMAZON_PARTNER_TAG,
      PartnerType: PartnerType.ASSOCIATES,
      Keywords: params.keywords,
      SearchIndex: searchIndex,
      ItemCount: params.itemCount || 10,
      Resources: [
        Resources.ItemInfo.Title,
        Resources.ItemInfo.ByLineInfo,
        Resources.ItemInfo.Classifications,
        Resources.ItemInfo.ContentInfo,
        Resources.ItemInfo.ContentRating,
        Resources.ItemInfo.ExternalIds,
        Resources.ItemInfo.Features,
        Resources.ItemInfo.ManufactureInfo,
        Resources.ItemInfo.ProductInfo,
        Resources.ItemInfo.TechnicalInfo,
        Resources.ItemInfo.TradeInInfo,
        Resources.Offers.Listings.Availability.MaxOrderQuantity,
        Resources.Offers.Listings.Availability.Message,
        Resources.Offers.Listings.Availability.MinOrderQuantity,
        Resources.Offers.Listings.Availability.Type,
        Resources.Offers.Listings.Condition,
        Resources.Offers.Listings.DeliveryInfo.IsAmazonFulfilled,
        Resources.Offers.Listings.DeliveryInfo.IsFreeShippingEligible,
        Resources.Offers.Listings.DeliveryInfo.IsPrimeEligible,
        Resources.Offers.Listings.MerchantInfo,
        Resources.Offers.Listings.Price,
        Resources.Offers.Listings.ProgramEligibility.IsPrimeExclusive,
        Resources.Offers.Listings.ProgramEligibility.IsPrimePantry,
        Resources.Offers.Listings.Promotions,
        Resources.Offers.Listings.SavingBasis,
        Resources.Offers.Summaries.HighestPrice,
        Resources.Offers.Summaries.LowestPrice,
        Resources.Offers.Summaries.OfferCount,
        Resources.Images.Primary.Large,
        Resources.Images.Primary.Medium,
        Resources.Images.Primary.Small,
        Resources.Images.Variants.Large,
        Resources.Images.Variants.Medium,
        Resources.Images.Variants.Small,
        Resources.ItemInfo.ByLineInfo,
        Resources.ItemInfo.ManufactureInfo,
        Resources.ItemInfo.ProductInfo,
        Resources.ItemInfo.TechnicalInfo,
        Resources.CustomerReviews.StarRating,
        Resources.CustomerReviews.Count,
      ],
    }
    
    // Add price filters if provided
    if (params.minPrice || params.maxPrice) {
      searchItemsRequest.MinPrice = params.minPrice
      searchItemsRequest.MaxPrice = params.maxPrice
    }
    
    const response = await defaultApi.searchItems(searchItemsRequest)
    
    if (response.SearchResult?.Items) {
      return {
        success: true,
        items: response.SearchResult.Items.map((item: any) => ({
          asin: item.ASIN,
          title: item.ItemInfo?.Title?.DisplayValue || '',
          brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || '',
          manufacturer: item.ItemInfo?.ByLineInfo?.Manufacturer?.DisplayValue || '',
          description: item.ItemInfo?.Features?.DisplayValues?.join('. ') || '',
          price: item.Offers?.Listings?.[0]?.Price?.Amount || 0,
          currency: item.Offers?.Listings?.[0]?.Price?.Currency || 'USD',
          availability: item.Offers?.Listings?.[0]?.Availability?.Message || 'In Stock',
          isPrime: item.Offers?.Listings?.[0]?.DeliveryInfo?.IsPrimeEligible?.Value || false,
          images: {
            large: item.Images?.Primary?.Large?.URL || '',
            medium: item.Images?.Primary?.Medium?.URL || '',
            small: item.Images?.Primary?.Small?.URL || '',
          },
          rating: item.CustomerReviews?.StarRating?.Value || 0,
          reviewCount: item.CustomerReviews?.Count || 0,
          productUrl: `https://www.amazon.com/dp/${item.ASIN}?tag=${AMAZON_PARTNER_TAG}`,
          detailPageUrl: item.DetailPageURL || '',
        })),
        totalResults: response.SearchResult?.TotalResultCount || 0,
      }
    }
    
    return {
      success: false,
      error: 'No items found',
      items: [],
      totalResults: 0,
    }
  } catch (error: any) {
    console.error('Amazon API Error:', error)
    return {
      success: false,
      error: error.message || 'Failed to search Amazon products',
      items: [],
      totalResults: 0,
    }
  }
}

/**
 * Get Amazon product details by ASIN
 */
export async function getAmazonProductByASIN(asin: string) {
  try {
    const defaultApi = getAmazonClient()
    
    const getItemsRequest: GetItemsRequest = {
      PartnerTag: AMAZON_PARTNER_TAG,
      PartnerType: PartnerType.ASSOCIATES,
      ItemIds: [asin],
      ItemIdType: 'ASIN',
      Condition: ItemCondition.NEW,
      Resources: [
        Resources.ItemInfo.Title,
        Resources.ItemInfo.ByLineInfo,
        Resources.ItemInfo.Classifications,
        Resources.ItemInfo.ContentInfo,
        Resources.ItemInfo.ContentRating,
        Resources.ItemInfo.ExternalIds,
        Resources.ItemInfo.Features,
        Resources.ItemInfo.ManufactureInfo,
        Resources.ItemInfo.ProductInfo,
        Resources.ItemInfo.TechnicalInfo,
        Resources.ItemInfo.TradeInInfo,
        Resources.Offers.Listings.Availability.MaxOrderQuantity,
        Resources.Offers.Listings.Availability.Message,
        Resources.Offers.Listings.Availability.MinOrderQuantity,
        Resources.Offers.Listings.Availability.Type,
        Resources.Offers.Listings.Condition,
        Resources.Offers.Listings.DeliveryInfo.IsAmazonFulfilled,
        Resources.Offers.Listings.DeliveryInfo.IsFreeShippingEligible,
        Resources.Offers.Listings.DeliveryInfo.IsPrimeEligible,
        Resources.Offers.Listings.MerchantInfo,
        Resources.Offers.Listings.Price,
        Resources.Offers.Listings.ProgramEligibility.IsPrimeExclusive,
        Resources.Offers.Listings.ProgramEligibility.IsPrimePantry,
        Resources.Offers.Listings.Promotions,
        Resources.Offers.Listings.SavingBasis,
        Resources.Offers.Summaries.HighestPrice,
        Resources.Offers.Summaries.LowestPrice,
        Resources.Offers.Summaries.OfferCount,
        Resources.Images.Primary.Large,
        Resources.Images.Primary.Medium,
        Resources.Images.Primary.Small,
        Resources.Images.Variants.Large,
        Resources.Images.Variants.Medium,
        Resources.Images.Variants.Small,
        Resources.CustomerReviews.StarRating,
        Resources.CustomerReviews.Count,
      ],
    }
    
    const response = await defaultApi.getItems(getItemsRequest)
    
    if (response.ItemsResult?.Items && response.ItemsResult.Items.length > 0) {
      const item = response.ItemsResult.Items[0]
      
      return {
        success: true,
        item: {
          asin: item.ASIN,
          title: item.ItemInfo?.Title?.DisplayValue || '',
          brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || '',
          manufacturer: item.ItemInfo?.ByLineInfo?.Manufacturer?.DisplayValue || '',
          description: item.ItemInfo?.Features?.DisplayValues?.join('. ') || '',
          price: item.Offers?.Listings?.[0]?.Price?.Amount || 0,
          currency: item.Offers?.Listings?.[0]?.Price?.Currency || 'USD',
          availability: item.Offers?.Listings?.[0]?.Availability?.Message || 'In Stock',
          isPrime: item.Offers?.Listings?.[0]?.DeliveryInfo?.IsPrimeEligible?.Value || false,
          images: {
            large: item.Images?.Primary?.Large?.URL || '',
            medium: item.Images?.Primary?.Medium?.URL || '',
            small: item.Images?.Primary?.Small?.URL || '',
          },
          rating: item.CustomerReviews?.StarRating?.Value || 0,
          reviewCount: item.CustomerReviews?.Count || 0,
          productUrl: `https://www.amazon.com/dp/${item.ASIN}?tag=${AMAZON_PARTNER_TAG}`,
          detailPageUrl: item.DetailPageURL || '',
        },
      }
    }
    
    return {
      success: false,
      error: 'Product not found',
      item: null,
    }
  } catch (error: any) {
    console.error('Amazon API Error:', error)
    return {
      success: false,
      error: error.message || 'Failed to get Amazon product',
      item: null,
    }
  }
}

/**
 * Generate Amazon affiliate link
 */
export function generateAffiliateLink(asin: string, region: string = 'us'): string {
  const domainMap: Record<string, string> = {
    us: 'amazon.com',
    uk: 'amazon.co.uk',
    ca: 'amazon.ca',
    de: 'amazon.de',
    fr: 'amazon.fr',
    it: 'amazon.it',
    es: 'amazon.es',
    jp: 'amazon.co.jp',
    au: 'amazon.com.au',
  }
  
  const domain = domainMap[region] || domainMap.us
  const tag = AMAZON_PARTNER_TAG
  
  return `https://www.${domain}/dp/${asin}?tag=${tag}`
}

/**
 * Check if Amazon API credentials are configured
 */
export function isAmazonConfigured(): boolean {
  return !!(
    AMAZON_ACCESS_KEY &&
    AMAZON_SECRET_KEY &&
    AMAZON_PARTNER_TAG
  )
}

