"use client";

import Sidebar from "@/components/sidebar";
import { CategorySection } from "@/components/category-section";
import { CategoryDialog } from "@/components/category-dialog";
import { EditPanel } from "@/components/edit-panel";
import { useState, useEffect, useMemo, useCallback } from "react";
import { parseMarkdown } from "@/lib/parseMarkdown";
import { Category } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/hooks/use-auth";
import { useEditStore } from "@/lib/edit-store";
import { syncToGitHub } from "@/lib/sync-to-github";
import { toast, Toaster } from "sonner";

/**
 * 自定义 Hook：加载和解析数据
 */
function useCategoriesData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAndParseData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch("/README.md");
      if (!res.ok) throw new Error(`无法加载 README.md: ${res.status} ${res.statusText}`);
      
      const text = await res.text();
      const parsedCategories = await parseMarkdown(text);
      setCategories(parsedCategories);
      
      const hash = window.location.hash.slice(1);
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            history.replaceState(null, "", `#${hash}`);
          }
        }, 100);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "加载失败";
      console.error("加载或解析失败:", e);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAndParseData();
  }, [loadAndParseData]);

  return { categories, loading, error };
}

/**
 * 渲染加载、错误、空数据状态的函数
 */
const renderState = (message: string, isError = false) => (
  <div className="flex h-full bg-background">
    <div className="flex-1">
    <Sidebar categories={[]} onLogoClick={() => {}} onCategoryClick={() => {}} isCollapsed={false} showHiddenCategories={false} />
      <div className="text-center py-12">
        <p className={isError ? "text-destructive" : "text-muted-foreground"}>{message}</p>
      </div>
    </div>
  </div>
);

export default function HomePage() {
  const { categories, loading, error } = useCategoriesData();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isLogoClicked, setIsLogoClicked] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' });
  const isMobile = useIsMobile();
  
  const { isAuth, setPrivateKey } = useAuthStore();
  const { 
    setCategories, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    addSubCategory,
    updateSubCategory
  } = useEditStore();
  
  // 初始化编辑状态的分类数据
  useEffect(() => {
    if (isEditMode) {
      setCategories(categories);
    }
  }, [categories, setCategories, isEditMode]);
  
  const onLogoClick = useCallback(() => {
    setIsCollapsed(prev => !prev);
    setIsLogoClicked(Math.random() < 0.2); // 20% 概率触发点击事件，显示隐藏分类
  }, []);
  
  const showHiddenCategories = useMemo(() => isCollapsed && isLogoClicked, [isCollapsed, isLogoClicked]);

  useEffect(() => {
    if (isMobile) setIsCollapsed(true);
  }, [isMobile]);

  // 过滤分类：如果 showHiddenCategories 为 true，则显示所有分类（包括以 '!' 开头的）
  const filterCategories = useCallback((categories: Category[], showHidden: boolean) => 
    categories.filter(category => (category.name.startsWith('!') ? showHidden : true)), []
  );

  const filteredCategories = useMemo(() => filterCategories(categories, showHiddenCategories), [categories, showHiddenCategories, filterCategories]);

  const getDisplayName = useCallback((name: string) => (name.startsWith('!') ? name.substring(1) : name), []);

  const scrollToCategory = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
    }
  }, []);

  // 处理配置 GitHub App ID 和私钥
  const handleConfigureAuth = () => {
    toast.info("请先导入 GitHub App 私钥");
    // 直接触发文件选择
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pem,.key,text/plain';

    fileInput.onchange = (event) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content) {
            setPrivateKey(content);
            toast.success("私钥导入成功");
            // setIsEditMode(true);
          }
        };
        reader.readAsText(file);
      }
      // 重置文件输入
      event.target.value = '';
    };
    fileInput.click();
  };

  // 处理编辑按钮点击
  const handleEditClick = () => {
    if (!isAuth) {
      // 显示配置选项
      handleConfigureAuth();
    } else {
      setIsEditMode(true);
    }
  };

  // 处理编辑按钮点击
  const handleEditPanelClick = () => {
    if (!isAuth) {
      // 显示配置选项
      handleConfigureAuth();
    } else {
      setIsEditPanelOpen(true);
    }
  };

  // 处理取消编辑
  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  // 处理同步到 GitHub
  const handleSyncToGitHub = async () => {
    const { privateKey } = useAuthStore.getState();
    if (!privateKey) {
      toast.error('请先设置 GitHub App 私钥');
      return;
    }
    
    const latestCategories = useEditStore.getState().categories;
    const success = await syncToGitHub(latestCategories, privateKey);
    if (success) {
      setIsEditMode(false);
    }
  };

  // 获取最新的分类数据
  const latestCategories = useEditStore(state => state.categories);

  // 根据不同状态渲染内容
  if (loading) return renderState("加载中...");
  if (error) return renderState(error, true);
  if (categories.length === 0) return renderState("暂无数据...");

  return (
    <div className="flex h-full bg-background">
      <Sidebar categories={categories} onLogoClick={onLogoClick} onCategoryClick={scrollToCategory} isCollapsed={isCollapsed} showHiddenCategories={showHiddenCategories} />
      <div className={`flex-1 transition-all duration-500 ease-in-out ${isEditMode ? 'bg-secondary/10' : ''}`}>
        <div className="p-6 w-full mx-auto transition-all duration-500 ease-in-out">
          {/* 编辑相关按钮 */}
          <div className="flex justify-end items-center gap-2 mb-6">
            {isEditMode ? (
              <>
                <div className="flex justify-between w-full">
                    <Button onClick={handleSyncToGitHub} variant="default">
                      同步到Github
                    </Button>
                  <div className="flex gap-2">
                    {/* 添加新分类对话框 */}
                    <CategoryDialog
                      open={isAddCategoryDialogOpen}
                      onOpenChange={setIsAddCategoryDialogOpen}
                      title="添加新分类"
                      confirmText="添加"
                      category={newCategory}
                      onConfirm={(category) => {
                        if (category.name?.trim()) {
                          addCategory({
                            name: category.name,
                            icon: category.icon || '',
                            id: category.name.toLowerCase().replace(/\s+/g, '-'),
                            links: [],
                            subCategories: []
                          });
                          setNewCategory({ name: '', icon: '' });
                        }
                      }}
                      trigger={
                        <Button variant="outline">
                          新增分类
                        </Button>
                      }
                    />
                    <Button onClick={handleCancelEdit} variant="secondary">
                      取消
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
              <Button onClick={handleEditPanelClick} variant="default">
                旧版编辑
              </Button>
              <Button onClick={handleEditClick} variant="default">
                编辑
              </Button>
              </>
            )}
          </div>
          
          {isEditMode ? (
            // 编辑模式下传递原始分类名称，保留"!"标记
            latestCategories.map((category, index) => (
              <CategorySection 
                key={category.id} 
                category={category} 
                isEditMode={isEditMode}
                onEdit={(updatedCategory) => updateCategory(index, updatedCategory)}
                onDelete={() => deleteCategory(index)}
                onAddSubCategory={(categoryIndex, subCategory) => addSubCategory(index, subCategory)}
                onUpdateSubCategory={(categoryIndex, subCategoryIndex, subCategory) => updateSubCategory(index, subCategoryIndex, subCategory)}
              />
            ))
          ) : (
            // 非编辑模式下显示处理后的分类名称，移除"!"标记
            filteredCategories.map((category) => (
              <CategorySection key={category.id} category={{ ...category, name: getDisplayName(category.name) }} />
            ))
          )}
        </div>
      </div>

      {/* 旧入口: 编辑面板 */}
      {isEditPanelOpen && (
        <EditPanel
          categories={categories}
          onClose={() => setIsEditPanelOpen(false)}
        />
      )}
      
      {/* 通知组件 */}
      <Toaster />
    </div>
  );
}
