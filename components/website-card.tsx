"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/lib/types";
import { getFaviconFromUrl } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

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

  const getDisplayIcon = () => {
    if (iconError) {
      return "/default-favicon.svg";
    }
    return getFaviconFromUrl(link.url);
  };

  return (
    <Card
      className="group hover:shadow-md py-2 transition-all duration-200 cursor-pointer bg-white border-gray-200 hover:border-gray-300"
      onClick={handleVisit}
    >
      <CardContent className="px-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-4">
              {/* 网站图标 */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
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
                  {link.description || "..."}
                </p>
              </div>
            </div>
          </TooltipTrigger>
          {/* Tooltip 内容：网址 */}
          <TooltipContent side="bottom" className="max-w-xs break-all">
            {link.url}
          </TooltipContent>
        </Tooltip>
      </CardContent>
    </Card>
  );
}
