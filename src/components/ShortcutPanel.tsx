import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ShortcutPanelProps {
  onClose: () => void;
}

const shortcuts = [
  { category: '基础', items: [
    { keys: ['⌘', 'N'], description: '新建笔记' },
    { keys: ['⌘', 'S'], description: '保存当前笔记' },
    { keys: ['⌘', 'Z'], description: '撤销' },
    { keys: ['⌘', '⇧', 'Z'], description: '重做' },
  ]},
  { category: '导航', items: [
    { keys: ['⌘', 'B'], description: '切换侧边栏' },
    { keys: ['⌘', '⇧', 'F'], description: '聚焦搜索框' },
    { keys: ['⌘', '/'], description: '显示快捷键帮助' },
  ]},
  { category: '编辑', items: [
    { keys: ['⌘', 'B'], description: '加粗' },
    { keys: ['⌘', 'I'], description: '斜体' },
    { keys: ['⌘', 'U'], description: '下划线' },
    { keys: ['⌘', 'E'], description: '行内代码' },
    { keys: ['⌘', 'K'], description: '插入链接' },
    { keys: ['/'], description: '打开命令菜单' },
    { keys: ['[['], description: '插入双链引用' },
  ]},
  { category: '代码块', items: [
    { keys: ['Tab'], description: '缩进（代码块内）' },
    { keys: ['⇧', 'Tab'], description: '取消缩进（代码块内）' },
  ]},
];

export default function ShortcutPanel({ onClose }: ShortcutPanelProps) {
  // Esc 关闭
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      {/* 面板 */}
      <div className="relative bg-page-bg border border-border rounded-xl shadow-lg w-full max-w-[480px] mx-4 animate-slide-up">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">快捷键</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-text-tertiary hover:text-text-secondary rounded-lg transition-colors duration-150"
          >
            <X size={18} />
          </button>
        </div>

        {/* 内容 */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((section) => (
            <div key={section.category} className="mb-6 last:mb-0">
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div
                    key={item.description}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm text-text-secondary">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, index) => (
                        <span key={index}>
                          <kbd className="px-2 py-1 text-xs font-medium text-text-tertiary bg-hover-bg border border-border rounded-md">
                            {key}
                          </kbd>
                          {index < item.keys.length - 1 && (
                            <span className="text-text-muted mx-0.5">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 底部 */}
        <div className="px-6 py-3 border-t border-border text-center">
          <p className="text-xs text-text-muted">
            按 <kbd className="px-1.5 py-0.5 text-xs font-medium bg-hover-bg border border-border rounded">Esc</kbd> 关闭
          </p>
        </div>
      </div>
    </div>
  );
}
