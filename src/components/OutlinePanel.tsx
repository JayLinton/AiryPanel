import { useState, useEffect, useCallback } from 'react';
import { List, ChevronRight } from 'lucide-react';
import type { Editor } from '@tiptap/react';

interface OutlinePanelProps {
  editor: Editor;
}

interface HeadingItem {
  id: string;
  level: number;
  text: string;
  pos: number;
}

export default function OutlinePanel({ editor }: OutlinePanelProps) {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // 提取标题列表
  const extractHeadings = useCallback(() => {
    if (!editor) return;

    const items: HeadingItem[] = [];
    const doc = editor.state.doc;

    doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        const id = `heading-${pos}`;
        items.push({
          id,
          level: node.attrs.level,
          text: node.textContent,
          pos,
        });
      }
    });

    setHeadings(items);
  }, [editor]);

  // 监听编辑器更新和文档切换
  useEffect(() => {
    if (!editor) return;

    // 初始提取
    extractHeadings();

    // 监听内容更新
    const handleUpdate = () => {
      extractHeadings();
    };

    // 监听事务（包括文档切换）
    const handleTransaction = () => {
      extractHeadings();
    };

    editor.on('update', handleUpdate);
    editor.on('transaction', handleTransaction);

    return () => {
      editor.off('update', handleUpdate);
      editor.off('transaction', handleTransaction);
    };
  }, [editor, extractHeadings]);

  // 点击标题跳转
  const scrollToHeading = useCallback(
    (pos: number, id: string) => {
      if (!editor) return;

      setActiveId(id);

      // 滚动到标题位置
      const editorElement = editor.view.dom;
      const nodeDOM = editor.view.nodeDOM(pos);

      if (nodeDOM instanceof HTMLElement) {
        const container = editorElement.closest('.overflow-y-auto');
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const nodeRect = nodeDOM.getBoundingClientRect();
          const scrollTop = container.scrollTop + nodeRect.top - containerRect.top - 100;

          container.scrollTo({
            top: scrollTop,
            behavior: 'smooth',
          });
        }
      }

      // 设置光标位置
      editor.chain().focus().setTextSelection(pos).run();
    },
    [editor]
  );

  // 监听滚动，更新活跃标题
  useEffect(() => {
    if (!editor || headings.length === 0) return;

    const handleScroll = () => {
      const editorElement = editor.view.dom;
      const container = editorElement.closest('.overflow-y-auto');

      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const scrollTop = container.scrollTop;

      let currentActive: string | null = null;

      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        const nodeDOM = editor.view.nodeDOM(heading.pos);

        if (nodeDOM instanceof HTMLElement) {
          const nodeRect = nodeDOM.getBoundingClientRect();
          const relativeTop = nodeRect.top - containerRect.top + scrollTop;

          if (relativeTop <= scrollTop + 150) {
            currentActive = heading.id;
            break;
          }
        }
      }

      setActiveId(currentActive);
    };

    const editorElement = editor.view.dom;
    const container = editorElement.closest('.overflow-y-auto');

    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [editor, headings]);

  return (
    <div
      className={`shrink-0 border-l border-border bg-editor-bg transition-all duration-200 ${
        isCollapsed ? 'w-10' : 'w-56'
      }`}
    >
      {/* 头部 */}
      <div className="h-11 border-b border-border flex items-center justify-between px-3 bg-editor-bg">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <List size={14} className="text-text-muted" />
            <span className="text-xs font-medium text-text-muted">大纲</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 text-text-muted hover:text-text-secondary rounded transition-colors duration-150"
          title={isCollapsed ? '展开大纲' : '收起大纲'}
        >
          <ChevronRight
            size={14}
            className={`transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
          />
        </button>
      </div>

      {/* 标题列表 */}
      {!isCollapsed && (
        <div className="p-2 overflow-y-auto max-h-[calc(100vh-120px)]">
          {headings.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="text-xs text-text-muted">暂无标题</p>
              <p className="text-xs text-text-muted mt-1">使用 # 添加标题</p>
            </div>
          ) : (
            headings.map((heading) => (
              <button
                key={heading.id}
                onClick={() => scrollToHeading(heading.pos, heading.id)}
                className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors duration-150 ${
                  activeId === heading.id
                    ? 'bg-accent-light text-accent'
                    : 'text-text-secondary hover:bg-hover-bg hover:text-text-primary'
                }`}
                style={{
                  paddingLeft: `${(heading.level - 1) * 12 + 8}px`,
                  fontSize: heading.level === 1 ? '14px' : heading.level === 2 ? '13px' : '12px',
                  fontWeight: heading.level === 1 ? 600 : heading.level === 2 ? 500 : 400,
                }}
              >
                {heading.text || '无标题'}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}