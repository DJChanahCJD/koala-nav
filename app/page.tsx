"use client";

import Sidebar from "@/components/sidebar";
import { CategorySection } from "@/components/category-section";
import { useState } from "react";
import { useEffect } from "react";
import { parseMarkdown } from "@/lib/utils";

/**
 * 主页组件
 * 整合侧边栏和分类内容区域
 */
export default function HomePage() {
  const [readmeText, setReadmeText] = useState("");

  useEffect(() => {
    fetch("/README.md")
      .then((res) => res.text())
      .then(setReadmeText)
      .catch((err) => console.error("加载 README.md 失败:", err));
  }, []);
  const categories = parseMarkdown(readmeText);

  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(categoryId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex h-full bg-background">
      {/* 侧边栏 */}
      <Sidebar categories={categories} onCategoryClick={scrollToCategory} />

      {/* 主内容区域 */}
      <div className="flex-1">
        <div className="p-6 w-full mx-auto">
          {categories.map((category) => (
            <CategorySection
              key={category.name}
              category={category}
              links={category.links}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
