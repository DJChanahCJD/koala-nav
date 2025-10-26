"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Category } from "@/lib/types";
import { Github } from "lucide-react";
import Link from "next/link";

interface SidebarProps {
  onLogoClick: () => void;
  onCategoryClick: (categoryId: string) => void;
  isCollapsed: boolean;
  categories: Category[];
  showHiddenCategories?: boolean;
}

// 图标组件
const CategoryIcon = ({ category, isCollapsed }: { category: Category; isCollapsed: boolean }) => {
  if (category.icon) {
    return (
      <span className={cn("w-6 text-center", isCollapsed && "mx-auto")}>
        {category.icon}
      </span>
    );
  }

  return (
    <div className="text-xs font-bold bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center">
      {category.name.charAt(0).toUpperCase()}
    </div>
  );
};

// 过滤分类的辅助函数
const filterCategories = (categories: Category[], showHidden: boolean) => {
  return categories.filter(category => {
    if (category.name.startsWith('!')) {
      return showHidden;
    }
    return true;
  });
};

// 处理分类名称显示
const getDisplayName = (name: string) => 
  name.startsWith('!') ? name.substring(1) : name;

export default function Sidebar({ 
  categories, 
  onLogoClick, 
  onCategoryClick, 
  isCollapsed, 
  showHiddenCategories = false 
}: SidebarProps) {
  // 使用 useMemo 缓存过滤后的分类列表
  const filteredCategories = useMemo(
    () => filterCategories(categories, showHiddenCategories),
    [categories, showHiddenCategories]
  );
 
  return (
    <div
      className={cn(
        "flex flex-col left-0 top-0 min-h-[max(100%,100vh)] bg-white border-r border-secondary shadow-sm z-10 transition-all duration-300",
        isCollapsed ? "w-16" : "w-48",
        "dark:bg-gray-900 dark:border-gray-700"
      )}
    >
      {/* 顶部 Logo + 折叠按钮 */}
      <div className="flex items-center h-16 px-2 border-b border-secondary">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogoClick}
          className="flex items-center w-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <img src="/favicon.svg" alt="Koala Nav" className="w-6 h-6" />
          {!isCollapsed && (
            <h1 className="ml-3 text-lg font-semibold text-primary truncate">
              Koala Nav
            </h1>
          )}
        </Button>
      </div>

      {/* 中间导航区（可滚动） */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {filteredCategories.map((category) => (
            <Button
              key={category.id}
              variant="ghost"
              className={cn(
                "w-full hover:bg-gray-100 transition-colors duration-150",
                isCollapsed ? "px-2 justify-center" : "px-4 justify-start",
              )}
              onClick={() => onCategoryClick(category.id)}
            >
              <div className={cn("flex items-center gap-2", isCollapsed && "justify-center")}>
                <CategoryIcon category={category} isCollapsed={isCollapsed} />
                {!isCollapsed && (
                  <span className="truncate">
                    {getDisplayName(category.name)}
                  </span>
                )}
              </div>
            </Button>
          ))}
        </nav>
      </ScrollArea>

      {/* 底部版权信息 */}
      <div className="h-12 flex items-center justify-center border-t border-secondary">
        <p className="text-xs text-primary">
          <Link href="https://github.com/DJChanahCJD/koala-nav">
            <Github className="inline-block w-4 h-4 mr-1" />
            {!isCollapsed && <span>Koala Nav</span>}
          </Link>
        </p>
      </div>
    </div>
  );
}
