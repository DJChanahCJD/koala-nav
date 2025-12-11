/**
 * 将分类数据转换为 Markdown 格式
 * @param categories 分类数据
 * @returns Markdown 字符串
 */
export function toMarkdown(categories: any[]): string {
  let markdown = ''

  categories.forEach(category => {
    // 处理一级分类
    markdown += `## ${category.icon || ''} ${category.name}\n\n`

    // 处理一级分类下的链接
    if (category.links && category.links.length > 0) {
      category.links.forEach((link: any) => {
        markdown += `- [${link.name}](${link.url})${link.description ? ` - ${link.description}` : ''}\n`
      })
      markdown += '\n'
    }

    // 处理二级分类
    if (category.subCategories && category.subCategories.length > 0) {
      category.subCategories.forEach((subCategory: any) => {
        markdown += `### ${subCategory.name}\n\n`

        // 处理二级分类下的链接
        if (subCategory.links && subCategory.links.length > 0) {
          subCategory.links.forEach((link: any) => {
            markdown += `- [${link.name}](${link.url})${link.description ? ` - ${link.description}` : ''}\n`
          })
          markdown += '\n'
        }
      })
    }
  })

  return markdown
}
