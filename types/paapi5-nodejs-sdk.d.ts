declare module 'paapi5-nodejs-sdk' {
  export enum PartnerType {
    ASSOCIATES = 'Associates',
  }

  export enum ItemCondition {
    NEW = 'New',
    USED = 'Used',
    COLLECTIBLE = 'Collectible',
    REFURBISHED = 'Refurbished',
    ALL = 'All',
  }

  export enum SearchIndex {
    ALL = 'All',
    AMAZON_VIDEO = 'AmazonVideo',
    APPAREL = 'Apparel',
    APPLIANCES = 'Appliances',
    ARTS_AND_CRAFTS = 'ArtsAndCrafts',
    AUTOMOTIVE = 'Automotive',
    BABY = 'Baby',
    BEAUTY = 'Beauty',
    BOOKS = 'Books',
    CELLULAR = 'CellPhones',
    COLLECTIBLES = 'Collectibles',
    COMPUTERS = 'Computers',
    ELECTRONICS = 'Electronics',
    GARDEN = 'GardenAndOutdoor',
    GIFT_CARDS = 'GiftCards',
    GROCERY = 'GroceryAndGourmetFood',
    HEALTH = 'HealthPersonalCare',
    HEALTH_PERSONAL_CARE = 'HealthPersonalCare',
    HOME = 'HomeAndKitchen',
    INDUSTRIAL = 'Industrial',
    JEWELRY = 'Jewelry',
    KINDLESTORE = 'KindleStore',
    LUGGAGE = 'Luggage',
    MOBILE_APPS = 'MobileApps',
    MOVIES = 'MoviesAndTV',
    MUSIC = 'Music',
    MUSICAL_INSTRUMENTS = 'MusicalInstruments',
    OFFICE = 'OfficeProducts',
    PET_SUPPLIES = 'PetSupplies',
    PHOTO = 'Photo',
    SHOES = 'Shoes',
    SOFTWARE = 'Software',
    SPORTS = 'SportsAndOutdoors',
    TOOLS = 'ToolsAndHomeImprovement',
    TOYS = 'ToysAndGames',
    VIDEO_GAMES = 'VideoGames',
    WATCHES = 'Watches',
  }

  export const Resources: {
    ItemInfo: {
      Title: string[]
      ByLineInfo: string[]
      Classifications: string[]
      ContentInfo: string[]
      ContentRating: string[]
      ExternalIds: string[]
      Features: string[]
      ManufactureInfo: string[]
      ProductInfo: string[]
      TechnicalInfo: string[]
      TradeInInfo: string[]
    }
    Offers: {
      Listings: {
        Availability: {
          MaxOrderQuantity: string[]
          Message: string[]
          MinOrderQuantity: string[]
          Type: string[]
        }
        Condition: string[]
        DeliveryInfo: {
          IsAmazonFulfilled: string[]
          IsFreeShippingEligible: string[]
          IsPrimeEligible: string[]
        }
        MerchantInfo: string[]
        Price: string[]
        ProgramEligibility: {
          IsPrimeExclusive: string[]
          IsPrimePantry: string[]
        }
        Promotions: string[]
        SavingBasis: string[]
      }
      Summaries: {
        HighestPrice: string[]
        LowestPrice: string[]
        OfferCount: string[]
      }
    }
    Images: {
      Primary: {
        Large: string[]
        Medium: string[]
        Small: string[]
      }
      Variants: {
        Large: string[]
        Medium: string[]
        Small: string[]
      }
    }
    CustomerReviews: {
      StarRating: string[]
      Count: string[]
    }
  }

  export interface Resources {
    Images?: {
      Primary?: {
        Small?: string[]
        Medium?: string[]
        Large?: string[]
      }
    }
    ItemInfo?: {
      Title?: string[]
      ByLineInfo?: string[]
      Classification?: string[]
      ContentInfo?: string[]
      ExternalIds?: string[]
      Features?: string[]
      ManufactureInfo?: string[]
      ProductInfo?: string[]
      TechnicalInfo?: string[]
      TradeInInfo?: string[]
    }
    Offers?: {
      Listings?: string[]
      Summaries?: string[]
    }
    CustomerReviews?: {
      StarRating?: string[]
      Count?: string[]
    }
    BrowseNodeInfo?: {
      BrowseNodes?: string[]
    }
  }

  export interface SearchItemsRequest {
    PartnerTag: string
    PartnerType: PartnerType
    Keywords?: string
    SearchIndex?: SearchIndex
    Resources?: any[] | any
    ItemCount?: number
    ItemPage?: number
    Merchant?: string
    Condition?: ItemCondition
    DeliveryFlags?: string[]
    BrowseNodeId?: string
    LanguagesOfPreference?: string[]
    CurrencyOfPreference?: string
    ItemId?: string[]
    ItemIdType?: string
    OfferCount?: number
    Availability?: string
    MinPrice?: number
    MaxPrice?: number
    MinReviewsRating?: number
    MinSavingPercent?: number
    FilterReviewsRating?: number
    SortBy?: string
    Title?: string
  }

  export interface GetItemsRequest {
    PartnerTag: string
    PartnerType: PartnerType
    ItemIds: string[]
    ItemIdType: string
    Condition?: ItemCondition
    CurrencyOfPreference?: string
    LanguagesOfPreference?: string[]
    Merchant?: string
    OfferCount?: number
    Resources?: any[] | any
  }

  export class DefaultApi {
    constructor(config?: {
      accessKey?: string
      secretKey?: string
      host?: string
      region?: string
    })
    
    setAccessKey(accessKey: string): void
    setSecretKey(secretKey: string): void
    setHost(host: string): void
    setRegion(region: string): void
    setPartnerTag(partnerTag: string): void
    
    searchItems(searchItemsRequest: SearchItemsRequest): Promise<any>
    getItems(getItemsRequest: GetItemsRequest): Promise<any>
  }
}

