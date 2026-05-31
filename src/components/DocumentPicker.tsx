import { useState, useEffect, useRef } from 'react';
import { FileText } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import type { Editor } from '@tiptap/react';

interface DocumentPickerProps {
  editor: Editor;
  onClose: () => void;
}

export default function DocumentPicker({ editor, onClose }: DocumentPickerProps) {
  const { state } = useApp();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filter, setFilter] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 当前文档（排除自身）
  const currentDocId = state.currentDocId;

  // 过滤文档列表
  const filteredDocs = state.documents
    .filter((doc) => doc.id !== currentDocId)
    .filter((doc) => {
      if (!filter) return true;
      return doc.title.toLowerCase().includes(filter.toLowerCase());
    });

  // 删除 [[ 字符
  function deleteBrackets() {
    const { state } = editor;
    const { $from } = state.selection;
    const textBefore = $from.parent.textContent;
    const bracketsIndex = textBefore.lastIndexOf('[[');
    if (bracketsIndex >= 0) {
      const from = $from.pos - ($from.parentOffset - bracketsIndex);
      const to = $from.pos;
      editor.chain().deleteRange({ from, to }).run();
    }
  }

  // 插入双链
  function insertWikiLink(_docId: string, label: string) {
    deleteBrackets();
    // 插入带有特殊标记的文本
    editor.chain().focus().insertContent(`[[${label}]]`).run();
    // 注意：这里简化处理，实际应该使用自定义节点
    onClose();
  }

  // 监听输入
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '[') return; // 忽略初始的 [[

      if (e.key === 'Backspace') {
        if (filter.length > 0) {
          setFilter((prev) => prev.slice(0, -1));
        } else {
          onClose();
        }
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && e.key !== ']') {
        setFilter((prev) => prev + e.key);
        setSelectedIndex(0);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filter, onClose]);

  // 键盘导航
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredDocs.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredDocs.length) % filteredDocs.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredDocs.length > 0) {
          const doc = filteredDocs[selectedIndex];
          insertWikiLink(doc.id, doc.title);
        }
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ']') {
        // 检查是否已经输入了完整的 ]]
        const { state } = editor;
        const { $from } = state.selection;
        const textBefore = $from.parent.textContent;
        if (textBefore.endsWith(']')) {
          onClose();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredDocs, onClose]);

  // 点击外部关闭
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // 滚动到选中项
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // 获取光标位置
  function getCursorPosition(): { top: number; left: number } {
    const { view } = editor;
    const { from } = view.state.selection;
    const coords = view.coordsAtPos(from);
    const editorRect = view.dom.getBoundingClientRect();

    return {
      top: coords.bottom - editorRect.top + 8,
      left: coords.left - editorRect.left,
    };
  }

  const pos = getCursorPosition();

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-page-bg border border-border rounded-xl shadow-lg py-1.5 w-72 max-h-[340px] overflow-y-auto animate-slide-up"
      style={{ top: pos.top, left: pos.left }}
    >
      {/* 搜索提示 */}
      {filter && (
        <div className="px-3 py-1.5 text-xs text-text-tertiary border-b border-border mb-1">
          搜索: {filter}
        </div>
      )}

      <div ref={listRef}>
        {filteredDocs.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <p className="text-sm text-text-tertiary">没有找到文档</p>
          </div>
        ) : (
          filteredDocs.map((doc, index) => (
            <button
              key={doc.id}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors duration-75 ${
                index === selectedIndex
                  ? 'bg-hover-bg'
                  : 'hover:bg-hover-bg'
              }`}
              onClick={() => insertWikiLink(doc.id, doc.title)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className={`p-1.5 rounded-md ${
                index === selectedIndex
                  ? 'bg-accent text-white'
                  : 'bg-hover-bg text-text-secondary'
              }`}>
                {doc.icon ? (
                  <span className="text-base">{doc.icon}</span>
                ) : (
                  <FileText size={16} />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary truncate">
                  {doc.title}
                </div>
                {doc.tags && doc.tags.length > 0 && (
                  <div className="text-xs text-text-tertiary truncate">
                    {doc.tags.slice(0, 3).join(', ')}
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
