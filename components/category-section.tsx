"use client";

import type { Category } from "@/lib/types";
import { WebsiteCard } from "./website-card";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface CategorySectionProps {
  category: Category;
}

/**
 * 分类区块组件
 * 展示一个分类下的所有网站链接，使用TAB组件切换显示二级分类
 */
export function CategorySection({ category }: CategorySectionProps) {
  // 如果有二级分类，则默认选中第一个
  const [activeTab, setActiveTab] = useState(
    category.subCategories && category.subCategories.length > 0
      ? `${category.id}-${
          category.subCategories[0].id ||
          category.subCategories[0].name.toLowerCase().replace(/\s+/g, "-")
        }`
      : ""
  );

  return (
    <section className="mb-12 scroll-mt-20" id={category.id}>
      {/* 分类标题 */}
      <div className="flex items-center space-x-3 mb-6 pb-2 border-b border-secondary gap-2">
        {category.icon ? (
          category.icon
        ) : (
          <div
            className={
              "text-sm font-bold bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center"
            }
          >
            {category.name.charAt(0).toUpperCase()}
          </div>
        )}
        <h2 className="text-2xl font-bold text-primary">{category.name}</h2>
      </div>

      {/* 一级直接链接 */}
      {category.links && category.links.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {category.links.map((link) => (
            <WebsiteCard key={link.name} link={link} />
          ))}
        </div>
      )}

      {/* 二级分类 - 使用TAB组件 */}
      {category.subCategories && category.subCategories.length > 0 && (
        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          {/* TAB列表 */}
          <TabsList className="mb-6 overflow-x-auto flex whitespace-nowrap p-1">
            {category.subCategories.map((sub) => {
              const tabId = `${category.id}-${
                sub.id || sub.name.toLowerCase().replace(/\s+/g, "-")
              }`;
              return (
                <TabsTrigger
                  key={sub.name}
                  value={tabId}
                  className="flex-shrink-0 px-4 py-2"
                >
                  {sub.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* TAB内容 */}
          {category.subCategories.map((sub) => {
            const tabId = `${category.id}-${
              sub.id || sub.name.toLowerCase().replace(/\s+/g, "-")
            }`;
            return (
              <TabsContent key={sub.name} value={tabId} id={tabId}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sub.links.map((link) => (
                    <WebsiteCard key={link.name} link={link} />
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </section>
  );
}
