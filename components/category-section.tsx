"use client";

import type { Category } from "@/lib/types";
import { WebsiteCard } from "./website-card";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Edit, Trash2 } from "lucide-react";
import { CategoryDialog } from "./category-dialog";

interface CategorySectionProps {
  category: Category;
  isEditMode?: boolean;
  onEdit?: (category: Category) => void;
  onDelete?: () => void;
  onAddSubCategory?: (categoryIndex: number, subCategory: any) => void;
  onUpdateSubCategory?: (categoryIndex: number, subCategoryIndex: number, subCategory: any) => void;
}

/**
 * 分类区块组件
 * 展示一个分类下的所有网站链接，使用TAB组件切换显示二级分类
 */
export function CategorySection({ 
  category, 
  isEditMode = false, 
  onEdit, 
  onDelete,
  onAddSubCategory,
  onUpdateSubCategory
}: CategorySectionProps) {
  // 如果有二级分类，则默认选中第一个
  const [activeTab, setActiveTab] = useState(
    category.subCategories && category.subCategories.length > 0
      ? `${category.id}-${
          category.subCategories[0].id ||
          category.subCategories[0].name.toLowerCase().replace(/\s+/g, "-")
        }`
      : ""
  );
  
  // 编辑模式下的状态
  const [isEditing, setIsEditing] = useState(false);
  const [editedCategory, setEditedCategory] = useState(category);
  
  // 子分类编辑状态
  const [editingSubCategoryIndex, setEditingSubCategoryIndex] = useState<number | null>(null);
  const [editingSubCategoryName, setEditingSubCategoryName] = useState("");

  return (
    <section 
      className={`mb-12 scroll-mt-20 transition-all duration-500 ease-in-out transform ${isEditMode ? 'border-2 border-dashed border-primary rounded-lg p-4 bg-primary/5 shadow-sm hover:shadow-md hover:scale-[1.01]' : ''}`} 
      id={category.id}
    >
      {/* 分类标题 */}
      <div className="flex items-center justify-between space-x-3 mb-4 pb-2 border-b border-secondary gap-2">
        <div className="flex items-center space-x-3 gap-2">
          {category.icon ? (
            category.icon
          ) : (
            <div
              className={
                "text-sm font-bold bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center"
              }
            >
              {category.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h2 className="text-2xl font-bold text-primary">{category.name}</h2>
        </div>
        
        {/* 编辑和删除按钮 */}
        {isEditMode && (
          <div className="flex items-center gap-2">
            <CategoryDialog
              open={isEditing}
              onOpenChange={setIsEditing}
              title="编辑分类"
              confirmText="保存"
              category={editedCategory}
              onConfirm={(updatedCategory) => {
                if (onEdit) {
                  onEdit({
                    ...editedCategory,
                    ...updatedCategory,
                    id: updatedCategory.name?.toLowerCase().replace(/\s+/g, '-') || editedCategory.id
                  });
                }
              }}
              trigger={
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="transition-all duration-300 hover:scale-105 hover:bg-primary/10"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              }
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDelete}
              className="transition-all duration-300 hover:scale-105 hover:bg-destructive/10 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* 一级直接链接 */}
      {category.links && category.links.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {category.links.map((link) => (
            <WebsiteCard key={link.name} link={link} />
          ))}
        </div>
      )}

      {/* 二级分类 - 使用TAB组件 */}
      {category.subCategories && category.subCategories.length > 0 && (
        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          {/* TAB列表 */}
          <TabsList className="mb-2 overflow-x-auto overflow-y-hidden flex whitespace-nowrap p-2 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
            {category.subCategories.map((sub, index) => {
              const tabId = `${category.id}-${
                sub.id || sub.name.toLowerCase().replace(/\s+/g, "-")
              }`;
              
              return (
                <div key={sub.name} className="flex items-center h-full">
                  {editingSubCategoryIndex === index ? (
                    <div className="flex items-center h-full p-1">
                      <input
                        type="text"
                        value={editingSubCategoryName}
                        onChange={(e) => setEditingSubCategoryName(e.target.value)}
                        onBlur={() => {
                          if (onUpdateSubCategory && editingSubCategoryName.trim()) {
                            onUpdateSubCategory(
                              0, // 这里假设categoryIndex为0，实际需要从父组件传递
                              index,
                              {
                                ...sub,
                                name: editingSubCategoryName.trim(),
                                id: editingSubCategoryName.trim().toLowerCase().replace(/\s+/g, "-")
                              }
                            );
                          }
                          setEditingSubCategoryIndex(null);
                          setEditingSubCategoryName("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur();
                          }
                        }}
                        className="h-9 px-3 py-1 border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <TabsTrigger
                      value={tabId}
                      className="flex-shrink-0 h-9 px-6 py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary rounded-md transition-all duration-200"
                      onDoubleClick={() => {
                        setEditingSubCategoryIndex(index);
                        setEditingSubCategoryName(sub.name);
                      }}
                    >
                      {sub.name}
                    </TabsTrigger>
                  )}
                </div>
              );
            })}
            
            {/* 添加子分类按钮 */}
            {isEditMode && (
              <button
                onClick={() => {
                  if (onAddSubCategory) {
                    const newSubCategory = {
                      name: "新子分类",
                      id: `new-subcategory-${Date.now()}`,
                      links: []
                    };
                    onAddSubCategory(0, newSubCategory); // 这里假设categoryIndex为0，实际需要从父组件传递
                  }
                }}
                className="flex-shrink-0 h-9 px-4 py-0 border-2 border-dashed border-primary text-primary rounded-md hover:bg-primary/10 transition-all duration-200 flex items-center justify-center"
                title="添加子分类"
              >
                +
              </button>
            )}
          </TabsList>

          {/* TAB内容 */}
          {category.subCategories.map((sub) => {
            const tabId = `${category.id}-${
              sub.id || sub.name.toLowerCase().replace(/\s+/g, "-")
            }`;
            return (
              <TabsContent key={sub.name} value={tabId} id={tabId}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sub.links.map((link) => (
                    <WebsiteCard key={link.name} link={link} />
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </section>
  );
}
