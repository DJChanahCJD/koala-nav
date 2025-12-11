/**
 * GitHub 仓库配置
 * 请参考 https://www.yysuni.com/blog/readme 安装 GitHub App
*/
// 
export const GITHUB_CONFIG = {
	OWNER: process.env.NEXT_PUBLIC_GITHUB_OWNER || 'DJChanahCJD',
	REPO: process.env.NEXT_PUBLIC_GITHUB_REPO || 'koala-nav',
	BRANCH: process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main',
	APP_ID: process.env.NEXT_PUBLIC_GITHUB_APP_ID || '2451544',	// todo: 从环境变量获取 APP_ID
	ENCRYPT_KEY: process.env.NEXT_PUBLIC_GITHUB_ENCRYPT_KEY || 'default-encrypt-key123',
} as const