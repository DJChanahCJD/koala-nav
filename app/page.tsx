"use client"

import Sidebar from "@/components/sidebar";
import { CategorySection } from "@/components/category-section";
import { useState, useEffect } from "react";
import { parseMarkdown } from "@/lib/parseMarkdown";
import { Category } from "@/lib/types";

/**
 * 主页组件
 * 整合侧边栏和分类内容区域
 * 使用 remark 解析 Markdown 内容
 */
export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAndParseData() {
      try {
        setLoading(true);
        setError(null);
        
        // 加载 README.md 文件
        const res = await fetch("/README.md");
        if (!res.ok) {
          throw new Error(`无法加载 README.md: ${res.status} ${res.statusText}`);
        }
        
        const text = await res.text();
        
        // 异步解析 Markdown 内容
        const parsedCategories = await parseMarkdown(text);
        setCategories(parsedCategories);
        
        // 检查 URL hash，如果存在则滚动到对应位置
        const hash = window.location.hash.slice(1);
        if (hash) {
          setTimeout(() => {
            scrollToCategory(hash);
          }, 100);
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "加载失败";
        console.error("加载或解析失败:", e);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadAndParseData();
  }, []);

  const scrollToCategory = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      // 更新地址栏hash但不新增历史记录
      history.replaceState(null, "", `#${id}`);
    }
  };

  return (
    <div className="flex h-full bg-background">
      {/* 侧边栏 */}
      <Sidebar categories={categories} onCategoryClick={scrollToCategory} />

      {/* 主内容区域 */}
      <div className="flex-1">
        <div className="p-6 w-full mx-auto">
          {loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">加载中...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
            </div>
          )}
          
          {!loading && !error && categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">暂无数据...</p>
            </div>
          )}
          
          {!loading && !error && categories.length > 0 && (
            categories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
