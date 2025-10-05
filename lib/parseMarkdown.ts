/**
/**
 * 使用 remark 解析 Markdown 内容
 * 自动识别 ## 一级分类、### 二级分类、列表中的链接
 */
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import type { Category, SubCategory, Link } from '@/lib/types';
import { slugify } from './utils';

export async function parseMarkdown(md: string): Promise<Category[]> {
  const tree = unified().use(remarkParse).parse(md);
  const categories: Category[] = [];

  let currentCategory: Category | null = null;
  let currentSubCategory: SubCategory | null = null;

  // 遍历 AST 树中的所有节点
  for (const node of tree.children) {
    // 处理 H2 标题作为一级分类
    if (node.type === 'heading' && node.depth === 2) {
      const name = extractTextFromNode(node);
      const id = slugify(name);
      
      // 检查是否有 emoji 作为图标
      const icon = extractEmoji(node);
      
      currentCategory = {
        name: name.replace(icon, '').trim(),
        id,
        icon,
        links: [],
        subCategories: []
      };
      categories.push(currentCategory);
      currentSubCategory = null;
    }
    // 处理 H3 标题作为二级分类
    else if (node.type === 'heading' && node.depth === 3) {
      if (!currentCategory) {
        // 如果出现 H3 但没有 H2，创建一个默认分类
        currentCategory = {
          name: '未分类',
          id: 'uncategorized',
          icon: '',
          links: [],
          subCategories: []
        };
        categories.push(currentCategory);
      }
      const name = extractTextFromNode(node);
      const id = `${currentCategory.id}-${slugify(name)}`;
      
      currentSubCategory = {
        name,
        id,
        links: []
      };
      
      if (!currentCategory.subCategories) {
        currentCategory.subCategories = [];
      }
      currentCategory.subCategories.push(currentSubCategory);
    }
    // 处理列表中的链接
    else if (node.type === 'list') {
      const links = extractLinksFromList(node);
      
      // 根据当前层级分配链接
      if (currentSubCategory) {
        currentSubCategory.links.push(...links);
      } else if (currentCategory) {
        currentCategory.links!.push(...links);
      } else {
        // 没有分类时放到默认分类
        let fallback = categories.find((c) => c.id === 'uncategorized');
        if (!fallback) {
          fallback = {
            name: '未分类',
            id: 'uncategorized',
            icon: '',
            links: [],
            subCategories: []
          };
          categories.push(fallback);
        }
        fallback.links!.push(...links);
      }
    }
  }

  // 记录解析结果用于调试
  console.debug('解析完成的分类数据:', JSON.stringify(categories, null, 2));
  return categories;
}

/**
 * 从节点中提取文本内容
 */
function extractTextFromNode(node: any): string {
  if (!node.children || !Array.isArray(node.children)) {
    return '';
  }
  
  return node.children
    .filter((n: any) => n.type === 'text' || n.type === 'emphasis' || n.type === 'strong')
    .map((n: any) => {
      if (n.type === 'text') {
        return n.value;
      } else {
        // 处理嵌套的文本节点
        return extractTextFromNode(n);
      }
    })
    .join('')
    .trim();
}

/**
 * 从标题节点中提取 emoji 作为图标
 */
function extractEmoji(node: any): string {
  if (!node.children || !Array.isArray(node.children)) {
    return '';
  }
  
  // 检查第一个文本节点是否包含 emoji
  const firstTextNode = node.children.find((n: any) => n.type === 'text');
  if (firstTextNode && firstTextNode.value) {
    // 匹配 emoji（使用 Unicode 属性转义）
    const emojiMatch = firstTextNode.value.match(/^[\p{Extended_Pictographic}\p{Emoji_Component}]+/u);
    if (emojiMatch) {
      return emojiMatch[0];
    }
  }
  
  return '';
}

/**
 * 从列表节点中提取链接
 */
function extractLinksFromList(listNode: any): Link[] {
  const links: Link[] = [];
  
  if (!listNode.children || !Array.isArray(listNode.children)) {
    return links;
  }
  
  for (const listItem of listNode.children) {
    // 通常链接在 paragraph 节点内
    const paragraph = listItem.children?.[0];
    if (!paragraph || paragraph.type !== 'paragraph') {
      continue;
    }
    
    // 寻找链接节点
    for (const child of paragraph.children) {
      if (child.type === 'link') {
        const name = extractTextFromNode(child);
        const url = child.url;
        const description = child.title || '';
        
        links.push({
          name,
          url,
          description
        });
      }
    }
  }
  
  return links;
}