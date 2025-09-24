'use client'

import type { Category, Link } from '@/lib/types'
import { WebsiteCard } from './website-card'
import React from 'react'

interface CategorySectionProps {
  category: Category
  links: Link[]
}

/**
 * 分类区块组件
 * 展示一个分类下的所有网站链接
 */
export function CategorySection({ category, links }: CategorySectionProps) {
  return (
    <section className="mb-12 scroll-mt-20" id={category.name}>
      {/* 分类标题 */}
      <div className="flex items-center space-x-3 mb-6 pb-2 border-b border-secondary gap-2">
        {category.icon}
        <h2 className="text-2xl font-bold text-primary">{category.name}</h2>
      </div>

      {/* 网站卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {links.map((link) => (
          <WebsiteCard key={link.name} link={link} />
        ))}
      </div>
    </section>
  )
}
