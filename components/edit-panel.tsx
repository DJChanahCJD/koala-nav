'use client'

import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet'
import { useEditStore } from '../lib/edit-store'
import { useAuthStore } from '../hooks/use-auth'
import { syncToGitHub } from '../lib/sync-to-github'
import { toast } from 'sonner'
import { Category } from '@/lib/types'

interface EditPanelProps {
  categories: Category[]
  onClose: () => void
}

export const EditPanel: React.FC<EditPanelProps> = ({ categories, onClose }) => {
  const {
    isEditMode,
    setCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
    addLink,
    addSubCategoryLink,
    updateLink,
    updateSubCategoryLink,
    deleteLink,
    deleteSubCategoryLink
  } = useEditStore()

  const { privateKey } = useAuthStore()
  
  // 本地状态，用于编辑表单
  const [editingCategory, setEditingCategory] = useState<{ index: number; data: any } | null>(null)
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' })
  const [editingSubCategory, setEditingSubCategory] = useState<{ categoryIndex: number; subCategoryIndex: number; data: any } | null>(null)
  const [newSubCategory, setNewSubCategory] = useState({ name: '' })
  const [editingLink, setEditingLink] = useState<{ categoryIndex: number; linkIndex: number; data: any } | null>(null)
  const [newLink, setNewLink] = useState({ name: '', url: '', description: '' })
  const [editingSubCategoryLink, setEditingSubCategoryLink] = useState<{ categoryIndex: number; subCategoryIndex: number; linkIndex: number; data: any } | null>(null)
  const [newSubCategoryLink, setNewSubCategoryLink] = useState({ name: '', url: '', description: '' })

  // 初始化编辑状态的分类数据
  React.useEffect(() => {
    setCategories(categories)
  }, [categories, setCategories])

  // 获取最新的分类数据
  const latestCategories = useEditStore(state => state.categories)

  // 处理同步到 GitHub
  const handleSyncToGitHub = async () => {
    if (!privateKey) {
      toast.error('请先设置 GitHub App 私钥')
      return
    }
    
    const success = await syncToGitHub(latestCategories, privateKey)
    if (success) {
      onClose()
    }
  }

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[33vw] min-w-[600px] p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="text-xl font-semibold text-gray-800">编辑导航内容</SheetTitle>
          <SheetDescription className="text-sm text-gray-500">
            修改分类、子分类和链接，然后同步到 GitHub
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 添加新分类 */}
          <Card className="p-5 shadow-md border-2 border-blue-100 bg-blue-50">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-blue-700 font-medium">分类图标</label>
                <Input
                  placeholder="🎉"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  className="w-full h-10 text-center border-blue-200 focus:border-blue-400 focus:ring-blue-200"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-blue-700 font-medium">分类名称</label>
                <Input
                  placeholder="输入分类名称"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full h-10 border-blue-200 focus:border-blue-400 focus:ring-blue-200"
                />
              </div>
              <Button
                onClick={() => {
                  if (newCategory.name) {
                    addCategory({
                      name: newCategory.name,
                      icon: newCategory.icon,
                      id: newCategory.name.toLowerCase().replace(/\s+/g, '-'),
                      links: [],
                      subCategories: []
                    })
                    setNewCategory({ name: '', icon: '' })
                  }
                }}
                className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                添加新分类
              </Button>
            </div>
          </Card>

          {/* 编辑现有分类 */}
          {latestCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                {editingCategory?.index === categoryIndex ? (
                  <div className="flex gap-3 items-center flex-1">
                    <Input
                      placeholder="图标"
                      value={editingCategory.data.icon}
                      onChange={(e) => setEditingCategory({ ...editingCategory, data: { ...editingCategory.data, icon: e.target.value } })}
                      className="w-16 h-9 text-center"
                    />
                    <Input
                      placeholder="分类名称"
                      value={editingCategory.data.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, data: { ...editingCategory.data, name: e.target.value } })}
                      className="flex-1 h-9"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          updateCategory(categoryIndex, {
                            ...editingCategory.data,
                            id: editingCategory.data.name.toLowerCase().replace(/\s+/g, '-')
                          })
                          setEditingCategory(null)
                        }}
                        variant="default"
                        size="sm"
                        className="h-9"
                      >
                        保存
                      </Button>
                      <Button
                        onClick={() => setEditingCategory(null)}
                        variant="outline"
                        size="sm"
                        className="h-9"
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center w-full">
                    <h3 className="text-lg font-semibold text-gray-800">{category.icon} {category.name}</h3>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingCategory({ index: categoryIndex, data: { ...category } })}
                        variant="outline"
                        size="sm"
                        className="h-9"
                      >
                        编辑
                      </Button>
                      <Button
                        onClick={() => deleteCategory(categoryIndex)}
                        variant="destructive"
                        size="sm"
                        className="h-9"
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* 分类下的链接 */}
              <div className="mb-4">
                {category.links?.map((link: any, linkIndex: number) => (
                  <div key={linkIndex} className="flex gap-2 items-center mb-2">
                    {editingLink?.categoryIndex === categoryIndex && editingLink?.linkIndex === linkIndex ? (
                      <div className="flex gap-2 items-center w-full">
                        <Input
                          placeholder="名称"
                          value={editingLink.data.name}
                          onChange={(e) => setEditingLink({ ...editingLink, data: { ...editingLink.data, name: e.target.value } })}
                          className="w-28 h-9"
                        />
                        <Input
                          placeholder="URL"
                          value={editingLink.data.url}
                          onChange={(e) => setEditingLink({ ...editingLink, data: { ...editingLink.data, url: e.target.value } })}
                          className="flex-1 h-9"
                        />
                        <Input
                          placeholder="描述"
                          value={editingLink.data.description}
                          onChange={(e) => setEditingLink({ ...editingLink, data: { ...editingLink.data, description: e.target.value } })}
                          className="w-40 h-9"
                        />
                        <div className="flex gap-1">
                          <Button
                            onClick={() => {
                              updateLink(categoryIndex, linkIndex, editingLink.data)
                              setEditingLink(null)
                            }}
                            variant="default"
                            size="sm"
                            className="h-9"
                          >
                            保存
                          </Button>
                          <Button
                            onClick={() => setEditingLink(null)}
                            variant="outline"
                            size="sm"
                            className="h-9"
                          >
                            取消
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center w-full">
                        <span className="w-28 truncate text-sm text-gray-700 font-medium">{link.name}</span>
                        <span className="flex-1 truncate text-xs text-gray-500">{link.url}</span>
                        <span className="w-40 truncate text-xs text-gray-400">{link.description}</span>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => setEditingLink({ categoryIndex, linkIndex, data: { ...link } })}
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                          >
                            编辑
                          </Button>
                          <Button
                            onClick={() => deleteLink(categoryIndex, linkIndex)}
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-red-500"
                          >
                            删除
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* 添加新链接 */}
                <div className="flex gap-2 items-center mt-2 pt-3 border-gray-100">
                  <Input
                    placeholder="名称"
                    value={newLink.name}
                    onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                    className="w-28 h-8"
                  />
                  <Input
                    placeholder="URL"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    className="flex-1 h-8"
                  />
                  <Input
                    placeholder="描述"
                    value={newLink.description}
                    onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                    className="w-40 h-8"
                  />
                  <Button
                    onClick={() => {
                      if (newLink.name && newLink.url) {
                        addLink(categoryIndex, { ...newLink })
                        setNewLink({ name: '', url: '', description: '' })
                      }
                    }}
                    variant="secondary"
                    size="sm"
                    className="h-8 text-xs"
                  >
                    添加
                  </Button>
                </div>
              </div>

              {/* 子分类 */}
              <div className="space-y-4 mt-4">

                
                {category.subCategories?.map((subCategory: any, subCategoryIndex: number) => (
                  <Card key={subCategoryIndex} className="p-3 shadow-sm border border-gray-100 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      {editingSubCategory?.categoryIndex === categoryIndex && editingSubCategory?.subCategoryIndex === subCategoryIndex ? (
                        <div className="flex gap-2 items-center w-full">
                          <Input
                            placeholder="子分类名称"
                            value={editingSubCategory.data.name}
                            onChange={(e) => setEditingSubCategory({ ...editingSubCategory, data: { ...editingSubCategory.data, name: e.target.value } })}
                            className="flex-1 h-9"
                          />
                          <div className="flex gap-1">
                            <Button
                              onClick={() => {
                                updateSubCategory(categoryIndex, subCategoryIndex, editingSubCategory.data)
                                setEditingSubCategory(null)
                              }}
                              variant="default"
                              size="sm"
                              className="h-9"
                            >
                              保存
                            </Button>
                            <Button
                              onClick={() => setEditingSubCategory(null)}
                              variant="outline"
                              size="sm"
                              className="h-9"
                            >
                              取消
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center w-full">
                          <h5 className="font-medium text-gray-800 flex items-center gap-2">
                            <span className="text-xs text-gray-400">📁</span>
                            {subCategory.name}
                          </h5>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => setEditingSubCategory({ categoryIndex, subCategoryIndex, data: { ...subCategory } })}
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs"
                            >
                              编辑
                            </Button>
                            <Button
                              onClick={() => deleteSubCategory(categoryIndex, subCategoryIndex)}
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-red-500"
                            >
                              删除
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 子分类下的链接 */}
                    <div className="space-y-2">
                      {subCategory.links?.map((link: any, linkIndex: number) => (
                        <div key={linkIndex} className="flex gap-2 items-center p-2 rounded bg-white border border-gray-100">
                          {editingSubCategoryLink?.categoryIndex === categoryIndex && 
                           editingSubCategoryLink?.subCategoryIndex === subCategoryIndex && 
                           editingSubCategoryLink?.linkIndex === linkIndex ? (
                            <div className="flex flex-wrap gap-2 items-center w-full">
                              <Input
                                placeholder="名称"
                                value={editingSubCategoryLink.data.name}
                                onChange={(e) => setEditingSubCategoryLink({ ...editingSubCategoryLink, data: { ...editingSubCategoryLink.data, name: e.target.value } })}
                                className="w-28 h-8 border-gray-200"
                              />
                              <Input
                                placeholder="URL"
                                value={editingSubCategoryLink.data.url}
                                onChange={(e) => setEditingSubCategoryLink({ ...editingSubCategoryLink, data: { ...editingSubCategoryLink.data, url: e.target.value } })}
                                className="flex-1 min-w-[200px] h-8 border-gray-200"
                              />
                              <Input
                                placeholder="描述"
                                value={editingSubCategoryLink.data.description}
                                onChange={(e) => setEditingSubCategoryLink({ ...editingSubCategoryLink, data: { ...editingSubCategoryLink.data, description: e.target.value } })}
                                className="w-40 h-8 border-gray-200"
                              />
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => {
                                    updateSubCategoryLink(categoryIndex, subCategoryIndex, linkIndex, editingSubCategoryLink.data)
                                    setEditingSubCategoryLink(null)
                                  }}
                                  variant="default"
                                  size="sm"
                                  className="h-8"
                                >
                                  保存
                                </Button>
                                <Button
                                  onClick={() => setEditingSubCategoryLink(null)}
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                >
                                  取消
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2 items-center w-full">
                              <span className="w-28 truncate text-sm text-gray-700 font-medium">{link.name}</span>
                              <span className="flex-1 truncate text-xs text-gray-500">{link.url}</span>
                              <span className="w-40 truncate text-xs text-gray-400">{link.description}</span>
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => setEditingSubCategoryLink({ categoryIndex, subCategoryIndex, linkIndex, data: { ...link } })}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-xs"
                                >
                                  编辑
                                </Button>
                                <Button
                                  onClick={() => deleteSubCategoryLink(categoryIndex, subCategoryIndex, linkIndex)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-xs text-red-500"
                                >
                                  删除
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* 添加新的子分类链接 */}
                      <div className="flex flex-wrap gap-2 items-center mt-2 pt-3 border-t border-gray-100">
                        <Input
                          placeholder="名称"
                          value={newSubCategoryLink.name}
                          onChange={(e) => setNewSubCategoryLink({ ...newSubCategoryLink, name: e.target.value })}
                          className="w-28 h-8 border-gray-200"
                        />
                        <Input
                          placeholder="URL"
                          value={newSubCategoryLink.url}
                          onChange={(e) => setNewSubCategoryLink({ ...newSubCategoryLink, url: e.target.value })}
                          className="flex-1 min-w-[200px] h-8 border-gray-200"
                        />
                        <Input
                          placeholder="描述"
                          value={newSubCategoryLink.description}
                          onChange={(e) => setNewSubCategoryLink({ ...newSubCategoryLink, description: e.target.value })}
                          className="w-40 h-8 border-gray-200"
                        />
                        <Button
                          onClick={() => {
                            if (newSubCategoryLink.name && newSubCategoryLink.url) {
                              addSubCategoryLink(categoryIndex, subCategoryIndex, { ...newSubCategoryLink })
                              setNewSubCategoryLink({ name: '', url: '', description: '' })
                            }
                          }}
                          variant="secondary"
                          size="sm"
                          className="h-8 text-xs"
                        >
                          添加
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {/* 添加新子分类输入框 */}
                <div className="flex gap-2 items-center p-3 border border-dashed border-gray-200 rounded bg-white">
                  <Input
                    placeholder="输入子分类名称"
                    value={newSubCategory.name}
                    onChange={(e) => setNewSubCategory({ ...newSubCategory, name: e.target.value })}
                    className="flex-1 h-9"
                  />
                  <Button
                      onClick={() => {
                        if (newSubCategory.name) {
                          addSubCategory(categoryIndex, {
                            name: newSubCategory.name,
                            id: `${category.name.toLowerCase().replace(/\s+/g, '-')}-${newSubCategory.name.toLowerCase().replace(/\s+/g, '-')}`,
                            links: []
                          })
                          setNewSubCategory({ name: '' })
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="h-9"
                    >
                      添加子分类
                    </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <SheetFooter className="border-t p-4 bg-gray-50">
          <div className="flex justify-between w-full">
            <Button onClick={onClose} variant="outline" className="h-10">
              取消
            </Button>
            <Button onClick={handleSyncToGitHub} variant="default" className="h-10 px-6">
              同步到 GitHub
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
