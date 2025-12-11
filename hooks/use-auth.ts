import { create } from 'zustand'
import { clearAllAuthCache, getAuthToken, getPemFromCache, hasAuth, savePemToCache } from '../lib/auth'

interface AuthStore {
	// State
	isAuth: boolean
	privateKey: string | null

	// Actions
	setPrivateKey: (key: string) => void
	clearAuth: () => void
	refreshAuthState: () => void
	getToken: () => Promise<string>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
	isAuth: false,
	privateKey: null,

	setPrivateKey: async (key: string) => {
		set({ isAuth: true, privateKey: key })
		await savePemToCache(key)
	},

	clearAuth: () => {
		clearAllAuthCache()
		set({ isAuth: false, privateKey: null })
	},

	refreshAuthState: async () => {
		set({ isAuth: await hasAuth() })
	},

	getToken: async () => {
		const privateKey = get().privateKey
		if (!privateKey) {
			throw new Error('需要先设置私钥')
		}
		const token = await getAuthToken(privateKey)
		get().refreshAuthState()
		return token
	}
}))

// 初始化认证状态
getPemFromCache().then((key) => {
	if (key) {
		useAuthStore.setState({ privateKey: key })
	}
})

hasAuth().then((isAuth) => {
	if (isAuth) {
		useAuthStore.setState({ isAuth })
	}
})
