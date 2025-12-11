import { toBase64Utf8 } from './github-client'
import { getAuthToken } from './auth'
import { GITHUB_CONFIG } from '../consts'
import { toMarkdown } from './to-markdown'
import { toast } from 'sonner'

/**
 * 将编辑后的分类数据同步到 GitHub
 * @param categories 分类数据
 * @param privateKey GitHub App 私钥
 * @returns 是否同步成功
 */
export async function syncToGitHub(categories: any[], privateKey: string): Promise<boolean> {
  try {
    toast.info('正在准备同步...')
    
    // 1. 将分类数据转换为 Markdown 格式
    const markdownContent = toMarkdown(categories)
    
    // 2. 获取认证令牌
    const token = await getAuthToken(privateKey)
    
    // 3. 准备文件内容
    const contentBase64 = toBase64Utf8(markdownContent)
    const message = '更新导航网站内容'
    
    // 4. 调用 GitHub API 上传文件
    toast.info('正在上传到 GitHub...')
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents/public/README.md`
    
    // 先获取文件的 SHA（如果存在）
    let sha: string | undefined
    const shaResponse = await fetch(`${url}?ref=${GITHUB_CONFIG.BRANCH}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    
    if (shaResponse.status === 200) {
      const shaData = await shaResponse.json()
      sha = shaData.sha
    }
    
    // 上传文件
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        content: contentBase64,
        branch: GITHUB_CONFIG.BRANCH,
        ...(sha ? { sha } : {})
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`GitHub API 错误: ${errorData.message || response.status}`)
    }
    
    toast.success('同步成功！')
    return true
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    toast.error(`同步失败: ${errorMessage}`)
    console.error('同步到 GitHub 失败:', error)
    return false
  }
}
