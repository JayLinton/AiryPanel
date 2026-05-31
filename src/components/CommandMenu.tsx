import { useState, useEffect, useRef, type ReactNode } from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  Type,
  Code,
  Quote,
  Minus,
  List,
  ListOrdered,
  CheckSquare,
  Table,
} from 'lucide-react';
import type { Editor } from '@tiptap/react';

interface CommandMenuProps {
  editor: Editor;
  onClose: () => void;
}

interface CommandItem {
  icon: ReactNode;
  title: string;
  description: string;
  shortcut?: string;
  category: string;
  action: () => void;
}

// 常用编程语言
const CODE_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', alias: 'js' },
  { id: 'typescript', name: 'TypeScript', alias: 'ts' },
  { id: 'python', name: 'Python', alias: 'py' },
  { id: 'bash', name: 'Bash', alias: 'sh' },
  { id: 'sql', name: 'SQL', alias: 'sql' },
  { id: 'json', name: 'JSON', alias: 'json' },
  { id: 'html', name: 'HTML', alias: 'html' },
  { id: 'css', name: 'CSS', alias: 'css' },
  { id: 'java', name: 'Java', alias: 'java' },
  { id: 'go', name: 'Go', alias: 'go' },
  { id: 'rust', name: 'Rust', alias: 'rs' },
  { id: 'markdown', name: 'Markdown', alias: 'md' },
];

export default function CommandMenu({ editor, onClose }: CommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filter, setFilter] = useState('');
  const [showLanguages, setShowLanguages] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 删除 "/" 字符
  function deleteSlash() {
    const { state } = editor;
    const { $from } = state.selection;
    const textBefore = $from.parent.textContent;
    const slashIndex = textBefore.lastIndexOf('/');
    if (slashIndex >= 0) {
      const from = $from.pos - ($from.parentOffset - slashIndex);
      const to = $from.pos;
      editor.chain().deleteRange({ from, to }).run();
    }
  }

  // 插入代码块
  function insertCodeBlock(_language?: string) {
    deleteSlash();
    editor.chain().focus().toggleCodeBlock().run();
    onClose();
  }

  // 插入表格
  function insertTable() {
    deleteSlash();
    // 使用 HTML 插入简单表格
    const html = '<table><tr><td></td><td></td></tr><tr><td></td><td></td></tr></table>';
    editor.chain().focus().insertContent(html).run();
    onClose();
  }

  // 命令列表
  const allCommands: CommandItem[] = [
    // 基础
    {
      icon: <Type size={18} />,
      title: '正文',
      description: '普通文本段落',
      shortcut: '',
      category: '基础',
      action: () => {
        deleteSlash();
        editor.chain().focus().setParagraph().run();
        onClose();
      },
    },
    {
      icon: <Heading1 size={18} />,
      title: '标题 1',
      description: '大标题',
      shortcut: '#',
      category: '基础',
      action: () => {
        deleteSlash();
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        onClose();
      },
    },
    {
      icon: <Heading2 size={18} />,
      title: '标题 2',
      description: '中标题',
      shortcut: '##',
      category: '基础',
      action: () => {
        deleteSlash();
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        onClose();
      },
    },
    {
      icon: <Heading3 size={18} />,
      title: '标题 3',
      description: '小标题',
      shortcut: '###',
      category: '基础',
      action: () => {
        deleteSlash();
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        onClose();
      },
    },
    // 列表
    {
      icon: <List size={18} />,
      title: '无序列表',
      description: '项目符号列表',
      shortcut: '-',
      category: '列表',
      action: () => {
        deleteSlash();
        editor.chain().focus().toggleBulletList().run();
        onClose();
      },
    },
    {
      icon: <ListOrdered size={18} />,
      title: '有序列表',
      description: '数字编号列表',
      shortcut: '1.',
      category: '列表',
      action: () => {
        deleteSlash();
        editor.chain().focus().toggleOrderedList().run();
        onClose();
      },
    },
    {
      icon: <CheckSquare size={18} />,
      title: '待办列表',
      description: '任务清单',
      shortcut: '[]',
      category: '列表',
      action: () => {
        deleteSlash();
        editor.chain().focus().toggleList('taskList', 'taskItem').run();
        onClose();
      },
    },
    // 高级
    {
      icon: <Quote size={18} />,
      title: '引用',
      description: '引用文本块',
      shortcut: '>',
      category: '高级',
      action: () => {
        deleteSlash();
        editor.chain().focus().toggleBlockquote().run();
        onClose();
      },
    },
    {
      icon: <Code size={18} />,
      title: '代码块',
      description: '插入代码块',
      shortcut: '```',
      category: '高级',
      action: () => {
        setShowLanguages(true);
        setSelectedIndex(0);
      },
    },
    {
      icon: <Minus size={18} />,
      title: '分隔线',
      description: '水平分割线',
      shortcut: '---',
      category: '高级',
      action: () => {
        deleteSlash();
        editor.chain().focus().setHorizontalRule().run();
        onClose();
      },
    },
    {
      icon: <Table size={18} />,
      title: '表格',
      description: '插入 2x2 表格',
      category: '高级',
      action: insertTable,
    },
  ];

  // 过滤命令或语言
  const filteredItems: CommandItem[] = showLanguages
    ? CODE_LANGUAGES.filter(
        (lang) =>
          lang.name.toLowerCase().includes(filter.toLowerCase()) ||
          lang.alias.toLowerCase().includes(filter.toLowerCase())
      ).map((lang) => ({
        icon: <Code size={18} />,
        title: lang.name,
        description: lang.alias,
        category: '语言',
        action: () => insertCodeBlock(lang.id),
      }))
    : allCommands.filter(
        (cmd) =>
          cmd.title.toLowerCase().includes(filter.toLowerCase()) ||
          cmd.description.toLowerCase().includes(filter.toLowerCase()) ||
          cmd.category.toLowerCase().includes(filter.toLowerCase())
      );

  // 按分类分组
  const groupedCommands: Record<string, CommandItem[]> = {};
  filteredItems.forEach((cmd) => {
    const category = cmd.category || '其他';
    if (!groupedCommands[category]) groupedCommands[category] = [];
    groupedCommands[category].push(cmd);
  });

  // 展平为列表
  const commands: CommandItem[] = [];
  Object.entries(groupedCommands).forEach(([, items]) => {
    items.forEach((item) => {
      commands.push(item);
    });
  });

  // 监听输入
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '/') return;

      if (e.key === 'Backspace') {
        if (filter.length > 0) {
          setFilter((prev) => prev.slice(0, -1));
        } else if (showLanguages) {
          setShowLanguages(false);
          setSelectedIndex(0);
        } else {
          onClose();
        }
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setFilter((prev) => prev + e.key);
        setSelectedIndex(0);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filter, onClose, showLanguages]);

  // 键盘导航
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % commands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + commands.length) % commands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (commands.length > 0) {
          commands[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        if (showLanguages) {
          setShowLanguages(false);
          setSelectedIndex(0);
        } else {
          onClose();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, commands, onClose, showLanguages]);

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
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
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

  // 渲染命令列表
  function renderCommands() {
    let currentIndex = 0;
    const elements: React.ReactNode[] = [];

    Object.entries(groupedCommands).forEach(([category, items]) => {
      elements.push(
        <div key={category} className="px-3 py-1.5 text-xs font-medium text-text-muted">
          {category}
        </div>
      );

      items.forEach((cmd) => {
        const index = currentIndex;
        elements.push(
          <button
            key={cmd.title}
            data-index={index}
            className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors duration-75 ${
              index === selectedIndex
                ? 'bg-hover-bg'
                : 'hover:bg-hover-bg'
            }`}
            onClick={cmd.action}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <span className={`p-1.5 rounded-md ${
              index === selectedIndex
                ? 'bg-accent text-white'
                : 'bg-hover-bg text-text-secondary'
            }`}>
              {cmd.icon}
            </span>
            <div className="flex-1">
              <div className="text-sm font-medium text-text-primary">{cmd.title}</div>
              <div className="text-xs text-text-muted">{cmd.description}</div>
            </div>
            {cmd.shortcut && (
              <span className="text-xs text-text-muted px-1.5 py-0.5 bg-hover-bg rounded">
                {cmd.shortcut}
              </span>
            )}
          </button>
        );
        currentIndex++;
      });
    });

    return elements;
  }

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-page-bg border border-border rounded-xl shadow-lg py-1.5 w-72 max-h-[340px] overflow-y-auto animate-slide-up"
      style={{ top: pos.top, left: pos.left }}
    >
      {/* 返回按钮（语言选择时） */}
      {showLanguages && (
        <div className="px-3 py-2 text-xs text-text-muted border-b border-border mb-1 flex items-center justify-between">
          <span>选择语言</span>
          <button
            onClick={() => {
              setShowLanguages(false);
              setSelectedIndex(0);
            }}
            className="text-accent hover:underline text-xs"
          >
            返回
          </button>
        </div>
      )}

      {/* 搜索提示 */}
      {filter && (
        <div className="px-3 py-1.5 text-xs text-text-muted border-b border-border mb-1">
          搜索: {filter}
        </div>
      )}

      <div ref={listRef}>
        {commands.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <p className="text-sm text-text-muted">没有匹配的命令</p>
          </div>
        ) : (
          renderCommands()
        )}
      </div>
    </div>
  );
}
