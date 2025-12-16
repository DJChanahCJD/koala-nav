"use client";

import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Category } from "@/lib/types";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  confirmText: string;
  category: Partial<Category>;
  onConfirm: (category: Partial<Category>) => void;
  trigger?: React.ReactNode;
}

/**
 * 分类对话框组件
 * 用于添加或编辑分类
 */
export function CategoryDialog({
  open,
  onOpenChange,
  title,
  confirmText,
  category,
  onConfirm,
  trigger
}: CategoryDialogProps) {
  const [formData, setFormData] = React.useState<Partial<Category>>(category);

  React.useEffect(() => {
    setFormData(category);
  }, [category]);

  const handleConfirm = () => {
    onConfirm(formData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* 图标和名称在同一行，图标输入框更小 */}
            <div className="flex items-center gap-4">
              <Input
                id="icon"
                value={formData.icon || ''}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="图标"
                className="w-20 text-center"
              />
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="分类名称"
                className="flex-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button onClick={handleConfirm}>
              {confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
}
