import { twMerge } from "tailwind-merge";
import { clsx, ClassValue } from "clsx";
import { Category, Link } from "./types";

/**
 * CSS 类名合并工具函数
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 解析 Markdown 格式的导航数据
 * @param content Markdown 格式的导航数据内容
 * @returns 解析后的分类数组
 */
export function parseMarkdown(content: string): Category[] {
  // 支持 CRLF 与 LF
  const lines = content.split(/\r?\n/);
  const categories: Category[] = [];
  let currentCategory: Category | null = null;

  // header 捕获：## + 可选 emoji + 名称
  // \p{Extended_Pictographic} 用于匹配 emoji（现代 JS 支持 Unicode property escapes）
  const headerRe = /^##\s*(\p{Extended_Pictographic}+)?\s*(.*)$/u;

  // link 正则：
  // - [名称](url "描述")
  // * [名称](url "描述")
  // - 支持 optional title（单/双引号）
  // - URL 捕获到第一个空格/引号/右括号之前（注意：包含非常规 url 情况时可用 markdown parser）
  const linkRe = /^[*-]\s*\[(.*?)\]\(\s*([^) "']+)(?:\s+["'](.+?)["'])?\s*\)$/;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue; // 跳过空行

    // 匹配二级标题（分类）
    const headerMatch = line.match(headerRe);
    if (headerMatch) {
      // 把上一个分类推入结果（如果存在）
      if (currentCategory) categories.push(currentCategory);

      const icon = headerMatch[1] ?? ""; // 可能没有 emoji
      const name = (headerMatch[2] || "").trim() || "未命名分类";

      currentCategory = {
        name,
        icon,
        links: [],
      };
      continue;
    }

    // 匹配链接项
    const linkMatch = line.match(linkRe);
    if (linkMatch && currentCategory) {
      const [, name, url, desc] = linkMatch;
      currentCategory.links.push({
        name: name.trim(),
        url: url.trim(),
        description: desc?.trim() ?? "",
      });
    }
    // 其它非目标行会被忽略（比如 # 顶部标题或不规则内容）
  }

  // 把最后一个分类加入
  if (currentCategory) categories.push(currentCategory);

  console.log(JSON.stringify(categories));
  return categories;
}

export function getFaviconFromUrl(url: string): string {
  const domain = new URL(url).hostname;
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}
