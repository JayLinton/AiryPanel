import { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Highlighter,
  Link,
  X,
  Check,
} from 'lucide-react';
import type { Editor } from '@tiptap/react';
import type { ReactNode } from 'react';

interface FloatingToolbarProps {
  editor: Editor;
}

interface ToolbarItem {
  type?: 'divider';
  icon?: ReactNode;
  title?: string;
  shortcut?: string;
  action?: () => void;
  isActive?: () => boolean;
}

export default function FloatingToolbar({ editor }: FloatingToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  // 设置链接
  function handleSetLink() {
    if (editor.isActive('link')) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    setShowLinkInput(true);
    setLinkUrl('');
  }

  // 确认链接
  function confirmLink() {
    if (linkUrl.trim()) {
      const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  }

  // 处理键盘事件
  function handleLinkKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmLink();
    } else if (e.key === 'Escape') {
      setShowLinkInput(false);
      setLinkUrl('');
    }
  }

  const tools: ToolbarItem[] = [
    {
      icon: <Bold size={16} />,
      title: '粗体',
      shortcut: '⌘B',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
    },
    {
      icon: <Italic size={16} />,
      title: '斜体',
      shortcut: '⌘I',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
    },
    {
      icon: <Underline size={16} />,
      title: '下划线',
      shortcut: '⌘U',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: () => editor.isActive('underline'),
    },
    {
      icon: <Strikethrough size={16} />,
      title: '删除线',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive('strike'),
    },
    {
      type: 'divider',
    },
    {
      icon: <Code size={16} />,
      title: '行内代码',
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: () => editor.isActive('code'),
    },
    {
      icon: <Highlighter size={16} />,
      title: '高亮',
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: () => editor.isActive('highlight'),
    },
    {
      icon: <Link size={16} />,
      title: '链接',
      action: handleSetLink,
      isActive: () => editor.isActive('link'),
    },
  ];

  // 链接输入模式
  if (showLinkInput) {
    return (
      <div className="flex items-center gap-1 bg-white border border-border rounded-lg p-1.5 shadow-lg animate-fade-in">
        <Link size={14} className="text-text-tertiary ml-1" />
        <input
          type="text"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyDown={handleLinkKeyDown}
          placeholder="输入链接地址..."
          className="flex-1 px-2 py-1 text-sm bg-transparent border-none outline-none placeholder-text-muted text-text-primary w-48"
          autoFocus
        />
        <button
          onClick={confirmLink}
          className="p-1.5 text-accent hover:bg-accent-light rounded transition-colors duration-150"
        >
          <Check size={14} />
        </button>
        <button
          onClick={() => {
            setShowLinkInput(false);
            setLinkUrl('');
          }}
          className="p-1.5 text-text-tertiary hover:text-text-secondary rounded transition-colors duration-150"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center bg-white border border-border rounded-lg p-1 shadow-lg animate-fade-in">
      {tools.map((tool, index) => {
        if (tool.type === 'divider') {
          return (
            <div
              key={`divider-${index}`}
              className="w-px h-5 bg-border mx-0.5"
            />
          );
        }

        return (
          <button
            key={tool.title}
            onClick={tool.action}
            title={`${tool.title}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
            className={`w-7 h-7 flex items-center justify-center rounded transition-all duration-100 ${
              tool.isActive?.()
                ? 'bg-gray-100 text-text-primary'
                : 'text-text-tertiary hover:bg-gray-100 hover:text-text-primary'
            }`}
          >
            {tool.icon}
          </button>
        );
      })}
    </div>
  );
}
