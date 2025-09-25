"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Category } from "@/lib/types";
import { Github } from "lucide-react";
import Link from "next/link";

interface SidebarProps {
  onCategoryClick: (categoryId: string) => void;
  categories: Category[];
}

export default function Sidebar({ categories, onCategoryClick }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

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
          onClick={() => setIsCollapsed(!isCollapsed)}
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
          {categories.map((category) => (
            <Button
              key={category.name}
              variant="ghost"
              className={cn(
                "w-full hover:bg-gray-100 transition-colors duration-150",
                isCollapsed ? "px-2 justify-center" : "px-4 justify-start",
              )}
              onClick={() => onCategoryClick(category.name)}
            >
              <div className="flex items-center gap-x-3">
                <span className="w-6 text-center">{category.icon}</span>
                {!isCollapsed && (
                  <span className="truncate">{category.name}</span>
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
