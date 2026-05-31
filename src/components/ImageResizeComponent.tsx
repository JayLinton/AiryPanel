import { useState, useRef, useCallback } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { GripVertical, Trash2 } from 'lucide-react';

export default function ImageResizeComponent({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const [showControls, setShowControls] = useState(false);
  const [editAlt, setEditAlt] = useState(false);
  const [altText, setAltText] = useState(node.attrs.alt || '');
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // 开始调整大小
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startXRef.current = e.clientX;
    startWidthRef.current = parseFloat(node.attrs.width) || 100;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.parentElement?.offsetWidth || 1;
      const diff = e.clientX - startXRef.current;
      const newWidth = Math.max(10, Math.min(100, startWidthRef.current + (diff / containerWidth) * 100));
      updateAttributes({ width: `${newWidth}%` });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [node.attrs.width, updateAttributes]);

  // 保存 alt 文本
  const handleSaveAlt = useCallback(() => {
    updateAttributes({ alt: altText });
    setEditAlt(false);
  }, [altText, updateAttributes]);

  return (
    <NodeViewWrapper
      ref={containerRef}
      className={`relative inline-block group ${selected ? 'ring-2 ring-accent-ring' : ''}`}
      style={{ width: node.attrs.width }}
    >
      {/* 图片 */}
      <img
        src={node.attrs.src}
        alt={node.attrs.alt || ''}
        title={node.attrs.title || ''}
        className="w-full h-auto rounded-md cursor-pointer"
        onClick={() => setShowControls(!showControls)}
        draggable={false}
      />

      {/* 图片说明 */}
      {node.attrs.alt && !editAlt && (
        <div className="text-center text-sm text-text-muted mt-2 px-2">
          {node.attrs.alt}
        </div>
      )}

      {/* 控制栏 */}
      {showControls && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 bg-page-bg border border-border rounded-lg shadow-lg z-10">
          <button
            onClick={() => updateAttributes({ width: '50%' })}
            className="p-1 text-text-muted hover:text-text-secondary rounded transition-colors"
            title="50%"
          >
            <span className="text-xs font-medium">50%</span>
          </button>
          <button
            onClick={() => updateAttributes({ width: '75%' })}
            className="p-1 text-text-muted hover:text-text-secondary rounded transition-colors"
            title="75%"
          >
            <span className="text-xs font-medium">75%</span>
          </button>
          <button
            onClick={() => updateAttributes({ width: '100%' })}
            className="p-1 text-text-muted hover:text-text-secondary rounded transition-colors"
            title="100%"
          >
            <span className="text-xs font-medium">100%</span>
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            onClick={() => {
              setEditAlt(true);
              setAltText(node.attrs.alt || '');
            }}
            className="p-1 text-text-muted hover:text-text-secondary rounded transition-colors"
            title="编辑说明"
          >
            <span className="text-xs">📝</span>
          </button>
          <button
            onClick={deleteNode}
            className="p-1 text-text-muted hover:text-red-500 rounded transition-colors"
            title="删除图片"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* 编辑 alt 文本 */}
      {editAlt && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="输入图片说明..."
            className="flex-1 px-3 py-1.5 text-sm border border-border rounded-md outline-none focus:ring-2 focus:ring-accent-ring"
            style={{ backgroundColor: 'var(--hover-bg)' }}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveAlt();
              if (e.key === 'Escape') setEditAlt(false);
            }}
          />
          <button
            onClick={handleSaveAlt}
            className="px-3 py-1.5 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-md transition-colors"
          >
            保存
          </button>
          <button
            onClick={() => setEditAlt(false)}
            className="px-3 py-1.5 text-sm text-text-muted hover:text-text-secondary rounded-md transition-colors"
          >
            取消
          </button>
        </div>
      )}

      {/* 调整大小的手柄 */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-12 cursor-col-resize opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center"
        onMouseDown={handleResizeStart}
      >
        <div className="w-4 h-8 bg-page-bg border border-border rounded-md flex items-center justify-center shadow-sm">
          <GripVertical size={12} className="text-text-muted" />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
