import { twMerge } from "tailwind-merge";
import { clsx, ClassValue } from "clsx";
import { Category, Link } from "./types";

/**
 * CSS 类名合并工具函数
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function getFaviconFromUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    // return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    return `https://favicon.im/${domain}`
  } catch {
    return '/default-favicon.svg';
  }
}

/**
 * 将文本转换为URL友好的slug
 * @param text 需要转换的文本
 * @returns URL友好的slug字符串
 */
export function slugify(text: string) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    // 允许中文字符，英文/数字，其他字符替换为 '-' 
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
