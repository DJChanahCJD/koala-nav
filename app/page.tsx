"use client";

import Sidebar from "@/components/sidebar";
import { CategorySection } from "@/components/category-section";
import { useState, useEffect, useMemo, useCallback } from "react";
import { parseMarkdown } from "@/lib/parseMarkdown";
import { Category } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * 自定义 Hook：加载和解析数据
 */
function useCategoriesData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAndParseData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch("/README.md");
      if (!res.ok) throw new Error(`无法加载 README.md: ${res.status} ${res.statusText}`);
      
      const text = await res.text();
      const parsedCategories = await parseMarkdown(text);
      setCategories(parsedCategories);
      
      const hash = window.location.hash.slice(1);
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            history.replaceState(null, "", `#${hash}`);
          }
        }, 100);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "加载失败";
      console.error("加载或解析失败:", e);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAndParseData();
  }, [loadAndParseData]);

  return { categories, loading, error };
}

/**
 * 渲染加载、错误、空数据状态的函数
 */
const renderState = (message: string, isError = false) => (
  <div className="flex h-full bg-background">
    <div className="flex-1">
    <Sidebar categories={[]} onLogoClick={() => {}} onCategoryClick={() => {}} isCollapsed={false} showHiddenCategories={false} />
      <div className="text-center py-12">
        <p className={isError ? "text-destructive" : "text-muted-foreground"}>{message}</p>
      </div>
    </div>
  </div>
);

export default function HomePage() {
  const { categories, loading, error } = useCategoriesData();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isLogoClicked, setIsLogoClicked] = useState(false);
  const isMobile = useIsMobile();
  
  const onLogoClick = useCallback(() => {
    setIsCollapsed(prev => !prev);
    setIsLogoClicked(Math.random() < 0.2); // 20% 概率触发点击事件，显示隐藏分类
  }, []);
  
  const showHiddenCategories = useMemo(() => isCollapsed && isLogoClicked, [isCollapsed, isLogoClicked]);

  useEffect(() => {
    if (isMobile) setIsCollapsed(true);
  }, [isMobile]);

  // 过滤分类：如果 showHiddenCategories 为 true，则显示所有分类（包括以 '!' 开头的）
  const filterCategories = useCallback((categories: Category[], showHidden: boolean) => 
    categories.filter(category => (category.name.startsWith('!') ? showHidden : true)), []
  );

  const filteredCategories = useMemo(() => filterCategories(categories, showHiddenCategories), [categories, showHiddenCategories, filterCategories]);

  const getDisplayName = useCallback((name: string) => (name.startsWith('!') ? name.substring(1) : name), []);

  const scrollToCategory = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
    }
  }, []);

  // 根据不同状态渲染内容
  if (loading) return renderState("加载中...");
  if (error) return renderState(error, true);
  if (categories.length === 0) return renderState("暂无数据...");

  return (
    <div className="flex h-full bg-background">
      <Sidebar categories={categories} onLogoClick={onLogoClick} onCategoryClick={scrollToCategory} isCollapsed={isCollapsed} showHiddenCategories={showHiddenCategories} />
      <div className="flex-1">
        <div className="p-6 w-full mx-auto">
          {filteredCategories.map((category) => (
            <CategorySection key={category.id} category={{ ...category, name: getDisplayName(category.name) }} />
          ))}
        </div>
      </div>
    </div>
  );
}
