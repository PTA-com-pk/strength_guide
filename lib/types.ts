import { IArticle, IAuthor, ICategory, ITag, IComment } from '@/models'

export interface ArticleWithRelations extends IArticle {
  author: IAuthor
  category: ICategory
  tags: ITag[]
  comments: IComment[]
}

export interface CategoryWithCount extends ICategory {
  articleCount?: number
}

export interface ArticleListItem {
  _id: string
  title: string
  slug: string
  excerpt?: string
  heroImage?: string
  publishedAt?: Date
  views: number
  author: {
    _id: string
    name: string
    avatar?: string
  }
  category: {
    _id: string
    name: string
    slug: string
  }
  tags: {
    _id: string
    name: string
    slug: string
  }[]
  commentCount: number
}
