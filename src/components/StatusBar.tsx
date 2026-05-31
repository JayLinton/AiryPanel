import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Check, Loader2, X } from 'lucide-react';

interface ContentStats {
  chars: number;
  words: number;
  paragraphs: number;
  codeBlocks: number;
  images: number;
  readTime: number;
}

export default function StatusBar() {
  const { state } = useApp();
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // 当前文档
  const currentDoc = state.documents.find((doc) => doc.id === state.currentDocId);

  // 更新保存时间
  useEffect(() => {
    if (currentDoc) {
      setLastSaved(currentDoc.updatedAt);
      setIsSaving(true);
      const timer = setTimeout(() => setIsSaving(false), 500);
      return () => clearTimeout(timer);
    }
  }, [currentDoc?.updatedAt]);

  // 计算内容统计
  const stats = useMemo<ContentStats>(() => {
    if (!currentDoc?.content) {
      return { chars: 0, words: 0, paragraphs: 0, codeBlocks: 0, images: 0, readTime: 0 };
    }

    try {
      const content = JSON.parse(currentDoc.content);
      const text = extractText(content);
      const chars = text.length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const paragraphs = countNodes(content, 'paragraph');
      const codeBlocks = countNodes(content, 'codeBlock');
      const images = countNodes(content, 'image');
      const readTime = Math.max(1, Math.ceil(words / 400)); // 假设每分钟 400 字

      return { chars, words, paragraphs, codeBlocks, images, readTime };
    } catch {
      return { chars: 0, words: 0, paragraphs: 0, codeBlocks: 0, images: 0, readTime: 0 };
    }
  }, [currentDoc?.content]);

  // 从 TipTap JSON 提取文本
  function extractText(node: Record<string, unknown>): string {
    if (node.type === 'text') {
      return (node.text as string) || '';
    }

    if (Array.isArray(node.content)) {
      return node.content.map((child: Record<string, unknown>) => extractText(child)).join('');
    }

    return '';
  }

  // 计算特定类型的节点数量
  function countNodes(node: Record<string, unknown>, type: string): number {
    let count = 0;

    if (node.type === type) {
      count++;
    }

    if (Array.isArray(node.content)) {
      node.content.forEach((child: Record<string, unknown>) => {
        count += countNodes(child, type);
      });
    }

    return count;
  }

  // 格式化时间
  function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) {
      return '刚刚';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} 分钟前`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} 小时前`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      });
    }
  }

  if (!currentDoc) {
    return null;
  }

  return (
    <>
      <div
        className="fixed bottom-4 z-40 flex items-center gap-3 px-3 py-1.5 rounded-lg bg-page-bg/80 backdrop-blur-sm border border-border/50 shadow-sm text-xs text-text-tertiary select-none transition-all duration-200"
        style={{ left: state.sidebarOpen ? '280px' : '16px' }}
      >
        <button
          onClick={() => setShowStats(true)}
          className="hover:text-text-secondary transition-colors duration-150"
        >
          {stats.chars} 字
        </button>

        {isSaving ? (
          <div className="flex items-center gap-1">
            <Loader2 size={12} className="animate-spin text-accent" />
            <span className="text-accent">保存中...</span>
          </div>
        ) : lastSaved ? (
          <div className="flex items-center gap-1">
            <Check size={12} className="text-green-500" />
            <span>已保存 {formatTime(lastSaved)}</span>
          </div>
        ) : null}
      </div>

      {/* 统计弹窗 */}
      {showStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={() => setShowStats(false)}
          />
          <div className="relative bg-page-bg border border-border rounded-xl shadow-lg w-full max-w-[320px] mx-4 animate-slide-up">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-text-primary">文档统计</h3>
              <button
                onClick={() => setShowStats(false)}
                className="p-1 text-text-tertiary hover:text-text-secondary rounded transition-colors duration-150"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">字符数</span>
                <span className="text-sm font-medium text-text-primary">{stats.chars}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">词数</span>
                <span className="text-sm font-medium text-text-primary">{stats.words}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">段落数</span>
                <span className="text-sm font-medium text-text-primary">{stats.paragraphs}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">代码块</span>
                <span className="text-sm font-medium text-text-primary">{stats.codeBlocks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">图片数</span>
                <span className="text-sm font-medium text-text-primary">{stats.images}</span>
              </div>
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-sm text-text-secondary">预计阅读时间</span>
                <span className="text-sm font-medium text-accent">{stats.readTime} 分钟</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
