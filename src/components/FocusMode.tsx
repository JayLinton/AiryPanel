import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Maximize2, Minimize2, Type } from 'lucide-react';
import { EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/react';

interface FocusModeProps {
  editor: Editor;
  onClose: () => void;
}

export default function FocusMode({ editor, onClose }: FocusModeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [typewriterMode, setTypewriterMode] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 进入全屏
  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch (err) {
      console.error('进入全屏失败:', err);
    }
  }, []);

  // 退出全屏
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    } catch (err) {
      console.error('退出全屏失败:', err);
    }
  }, []);

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 打字机模式：将当前行滚动到屏幕中央
  useEffect(() => {
    if (!typewriterMode || !editor || !containerRef.current) return;

    const handleUpdate = () => {
      const container = containerRef.current;
      if (!container) return;

      const { state } = editor;
      const { from } = state.selection;

      // 找到当前光标所在的 DOM 节点
      const coords = editor.view.coordsAtPos(from);
      if (coords) {
        const containerRect = container.getBoundingClientRect();
        const targetScrollTop = container.scrollTop + coords.top - containerRect.top - (containerRect.height / 2) + 20;

        container.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth',
        });
      }
    };

    editor.on('selectionUpdate', handleUpdate);
    return () => {
      editor.off('selectionUpdate', handleUpdate);
    };
  }, [editor, typewriterMode]);

  // 自动隐藏控制栏
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);

      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      fadeTimerRef.current = timer;
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  // ESC 键退出
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          exitFullscreen();
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, exitFullscreen, onClose]);

  // 组件卸载时退出全屏
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // 聚焦编辑器
  useEffect(() => {
    if (editor) {
      setTimeout(() => {
        editor.commands.focus();
      }, 100);
    }
  }, [editor]);

  return (
    <div className="fixed inset-0 z-[200] bg-page-bg flex flex-col animate-fade-in">
      {/* 控制栏 */}
      <div
        className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 transition-opacity duration-500 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-text-primary">专注模式</h2>
          {typewriterMode && (
            <span className="text-xs text-text-muted px-2 py-1 bg-hover-bg rounded-full">
              打字机模式
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 打字机模式切换 */}
          <button
            onClick={() => setTypewriterMode(!typewriterMode)}
            className={`p-2 rounded-lg transition-all duration-150 ${
              typewriterMode
                ? 'bg-accent-light text-accent'
                : 'text-text-muted hover:text-text-secondary hover:bg-hover-bg'
            }`}
            title={typewriterMode ? '关闭打字机模式' : '开启打字机模式'}
          >
            <Type size={18} />
          </button>

          {/* 全屏切换 */}
          <button
            onClick={isFullscreen ? exitFullscreen : enterFullscreen}
            className="p-2 text-text-muted hover:text-text-secondary hover:bg-hover-bg rounded-lg transition-colors duration-150"
            title={isFullscreen ? '退出全屏' : '进入全屏'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-secondary hover:bg-hover-bg rounded-lg transition-colors duration-150"
            title="退出专注模式 (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 编辑器内容 */}
      <div ref={containerRef} className="flex-1 overflow-y-auto focus-mode-content">
        <div className="max-w-[800px] mx-auto py-24 px-[min(48px,8vw)]">
          <EditorContent editor={editor} className="tiptap focus-mode-editor" />
          <div className="h-60" />
        </div>
      </div>

      {/* 底部提示 */}
      <div
        className={`absolute bottom-0 left-0 right-0 text-center py-4 transition-opacity duration-500 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <p className="text-xs text-text-muted">
          按 <kbd className="px-1.5 py-0.5 bg-hover-bg rounded text-text-secondary">Esc</kbd> 退出专注模式
        </p>
      </div>
    </div>
  );
}
