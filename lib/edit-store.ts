import { create } from 'zustand'
import type { Category } from './types'

interface EditStore {
	// State
	isEditMode: boolean
	categories: Category[]
	
	// Actions
	enableEditMode: () => void
	disableEditMode: () => void
	toggleEditMode: () => void
	setCategories: (categories: Category[]) => void
	addCategory: (category: Category) => void
	updateCategory: (index: number, category: Category) => void
	deleteCategory: (index: number) => void
	addSubCategory: (categoryIndex: number, subCategory: any) => void
	updateSubCategory: (categoryIndex: number, subCategoryIndex: number, subCategory: any) => void
	deleteSubCategory: (categoryIndex: number, subCategoryIndex: number) => void
	addLink: (categoryIndex: number, link: any) => void
	addSubCategoryLink: (categoryIndex: number, subCategoryIndex: number, link: any) => void
	updateLink: (categoryIndex: number, linkIndex: number, link: any) => void
	updateSubCategoryLink: (categoryIndex: number, subCategoryIndex: number, linkIndex: number, link: any) => void
	deleteLink: (categoryIndex: number, linkIndex: number) => void
	deleteSubCategoryLink: (categoryIndex: number, subCategoryIndex: number, linkIndex: number) => void
}

export const useEditStore = create<EditStore>((set, get) => ({
	isEditMode: false,
	categories: [],

	enableEditMode: () => set({ isEditMode: true }),
	disableEditMode: () => set({ isEditMode: false }),
	toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),

	setCategories: (categories: Category[]) => set({ categories }),

	addCategory: (category: Category) => set((state) => ({
		categories: [...state.categories, category]
	})),

	updateCategory: (index: number, category: Category) => set((state) => {
		const newCategories = [...state.categories]
		newCategories[index] = category
		return { categories: newCategories }
	}),

	deleteCategory: (index: number) => set((state) => {
		const newCategories = [...state.categories]
		newCategories.splice(index, 1)
		return { categories: newCategories }
	}),

	addSubCategory: (categoryIndex: number, subCategory: any) => set((state) => {
		const newCategories = [...state.categories]
		const category = newCategories[categoryIndex]
		if (!category.subCategories) {
			category.subCategories = []
		}
		category.subCategories.push(subCategory)
		return { categories: newCategories }
	}),

	updateSubCategory: (categoryIndex: number, subCategoryIndex: number, subCategory: any) => set((state) => {
		const newCategories = [...state.categories]
		const category = newCategories[categoryIndex]
		if (category.subCategories) {
			category.subCategories[subCategoryIndex] = subCategory
		}
		return { categories: newCategories }
	}),

	deleteSubCategory: (categoryIndex: number, subCategoryIndex: number) => set((state) => {
		const newCategories = [...state.categories]
		const category = newCategories[categoryIndex]
		if (category.subCategories) {
			category.subCategories.splice(subCategoryIndex, 1)
		}
		return { categories: newCategories }
	}),

	addLink: (categoryIndex: number, link: any) => set((state) => {
		const newCategories = [...state.categories]
		const category = newCategories[categoryIndex]
		if (!category.links) {
			category.links = []
		}
		category.links.push(link)
		return { categories: newCategories }
	}),

	addSubCategoryLink: (categoryIndex: number, subCategoryIndex: number, link: any) => set((state) => {
		const newCategories = [...state.categories]
		const category = newCategories[categoryIndex]
		if (category.subCategories && category.subCategories[subCategoryIndex]) {
			const subCategory = category.subCategories[subCategoryIndex]
			if (!subCategory.links) {
				subCategory.links = []
			}
			subCategory.links.push(link)
		}
		return { categories: newCategories }
	}),

	updateLink: (categoryIndex: number, linkIndex: number, link: any) => set((state) => {
		const newCategories = [...state.categories]
		const category = newCategories[categoryIndex]
		if (category.links) {
			category.links[linkIndex] = link
		}
		return { categories: newCategories }
	}),

	updateSubCategoryLink: (categoryIndex: number, subCategoryIndex: number, linkIndex: number, link: any) => set((state) => {
		const newCategories = [...state.categories]
		const category = newCategories[categoryIndex]
		if (category.subCategories && category.subCategories[subCategoryIndex] && category.subCategories[subCategoryIndex].links) {
			category.subCategories[subCategoryIndex].links[linkIndex] = link
		}
		return { categories: newCategories }
	}),

	deleteLink: (categoryIndex: number, linkIndex: number) => set((state) => {
		const newCategories = [...state.categories]
		const category = newCategories[categoryIndex]
		if (category.links) {
			category.links.splice(linkIndex, 1)
		}
		return { categories: newCategories }
	}),

	deleteSubCategoryLink: (categoryIndex: number, subCategoryIndex: number, linkIndex: number) => set((state) => {
		const newCategories = [...state.categories]
		const category = newCategories[categoryIndex]
		if (category.subCategories && category.subCategories[subCategoryIndex] && category.subCategories[subCategoryIndex].links) {
			category.subCategories[subCategoryIndex].links.splice(linkIndex, 1)
		}
		return { categories: newCategories }
	})
}))
