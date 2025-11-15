"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/lib/types";
import { getFaviconFromUrl } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { CopyIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WebsiteCardProps {
  link: Link;
}

/**
 * 网站卡片组件
 * 悬浮时显示网址
 */
export function WebsiteCard({ link }: WebsiteCardProps) {
  const [iconError, setIconError] = useState(false);

  const handleVisit = () => {
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  const handleIconError = () => {
    setIconError(true);
  };

  const handleCopyUrl = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发点击卡片跳转

    try {
      await navigator.clipboard.writeText(link.url);

      toast({
        title: "网址复制成功",
        description: link.url,
      });
    } catch (err) {
      console.error("复制失败: ", err);
      // 降级方案
      const textArea = document.createElement("textarea");
      textArea.value = link.url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast({
        title: "复制失败",
        description: "请手动复制网址",
      });
    }
  };

  const getDisplayIcon = () => {
    if (iconError) {
      return "/default-favicon.svg";
    }
    return getFaviconFromUrl(link.url);
  };

  return (
    <Card className="group hover:shadow-md py-2 transition-all duration-200 cursor-pointer bg-white border-gray-200 hover:border-gray-300">
      <CardContent className="px-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-4" onClick={handleVisit}>
              {/* 网站图标 */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center overflow-hidden border border-gray-200">
                  <img
                    src={getDisplayIcon()}
                    alt={link.name}
                    className="w-8 h-8"
                    onError={handleIconError}
                    loading="lazy"
                  />
                </div>
              </div>

              {/* 网站信息 */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 group-hover:text-primary transition-colors dark:text-gray-200 truncate">
                  {link.name}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-1 leading-relaxed dark:text-gray-400">
                  {link.description || link.name}
                </p>
              </div>
            </div>
          </TooltipTrigger>
          {/* Tooltip 内容：网址 */}
          <TooltipContent side="bottom" className="break-all">
            <div>
              {link.url}
              <span>
                <button
                  onClick={handleCopyUrl}
                  className="ml-2"
                  aria-label="复制网址"
                >
                  <CopyIcon className="w-3 h-3" />
                </button>
              </span>
            </div>
            {link.description || ""}
          </TooltipContent>
        </Tooltip>
      </CardContent>
    </Card>
  );
}
