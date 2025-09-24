

/**
 * 链接接口定义
 * 表示一个网站链接的基本信息
 */
export interface Link {
  name: string
  description: string
  url: string
}

/**
 * 分类接口定义
 * 表示一个网站分类，支持多种图标类型
 */
export interface Category {
  name: string
  icon: string
  links: Link[]
}