import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus,
  Heading1,
  Heading2,
  Heading3,
  Type,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Image as ImageIcon,
} from 'lucide-react';
import type { Editor } from '@tiptap/react';

interface BlockMenuProps {
  editor: Editor;
}

export default function BlockMenu({ editor }: BlockMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [hoveredBlock, setHoveredBlock] = useState<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 监听鼠标移动，显示/隐藏加号按钮
  useEffect(() => {
    if (!editor) return;

    const handleMouseMove = (e: MouseEvent) => {
      const editorElement = editor.view.dom;
      const editorRect = editorElement.getBoundingClientRect();

      // 扩大检测范围：编辑器左侧 60px 区域
      const isInTriggerZone =
        e.clientX >= editorRect.left - 60 &&
        e.clientX <= editorRect.left + 50 &&
        e.clientY >= editorRect.top &&
        e.clientY <= editorRect.bottom;

      if (!isInTriggerZone) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        hideTimeoutRef.current = setTimeout(() => {
          if (!showMenu) {
            setIsVisible(false);
            setHoveredBlock(null);
          }
        }, 200);
        return;
      }

      // 获取鼠标位置对应的块级元素
      const pos = editor.view.posAtCoords({ left: editorRect.left + 30, top: e.clientY });
      if (!pos) return;

      const $pos = editor.view.state.doc.resolve(pos.pos);
      let depth = $pos.depth;
      let blockElement: HTMLElement | null = null;

      while (depth > 0) {
        const node = $pos.node(depth);
        if (node.isBlock) {
          const dom = editor.view.nodeDOM($pos.before(depth));
          if (dom instanceof HTMLElement) {
            blockElement = dom;
            break;
          }
        }
        depth--;
      }

      if (blockElement && blockElement !== hoveredBlock) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        setHoveredBlock(blockElement);
        setIsVisible(true);

        // 计算按钮位置
        const blockRect = blockElement.getBoundingClientRect();
        setMenuPosition({
          top: blockRect.top - editorRect.top + editorElement.scrollTop + 2,
          left: -32,
        });
      }
    };

    const handleMouseLeave = () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      hideTimeoutRef.current = setTimeout(() => {
        if (!showMenu) {
          setIsVisible(false);
          setHoveredBlock(null);
        }
      }, 300);
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('mousemove', handleMouseMove);
    editorElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      editorElement.removeEventListener('mousemove', handleMouseMove);
      editorElement.removeEventListener('mouseleave', handleMouseLeave);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [editor, hoveredBlock, showMenu]);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 处理图片上传
  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          editor.chain().focus().setImage({ src: reader.result }).run();
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
    setShowMenu(false);
  }, [editor]);

  // 菜单项 - 使用网格布局
  const menuSections = [
    {
      title: '基础',
      items: [
        { icon: <Type size={15} />, title: '正文', action: () => { editor.chain().focus().setParagraph().run(); setShowMenu(false); } },
        { icon: <Minus size={15} />, title: '分隔线', action: () => { editor.chain().focus().setHorizontalRule().run(); setShowMenu(false); } },
        { icon: <ImageIcon size={15} />, title: '图片', action: handleImageUpload },
      ],
    },
    {
      title: '标题',
      items: [
        { icon: <Heading1 size={15} />, title: 'H1', action: () => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setShowMenu(false); } },
        { icon: <Heading2 size={15} />, title: 'H2', action: () => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setShowMenu(false); } },
        { icon: <Heading3 size={15} />, title: 'H3', action: () => { editor.chain().focus().toggleHeading({ level: 3 }).run(); setShowMenu(false); } },
      ],
    },
    {
      title: '列表',
      items: [
        { icon: <List size={15} />, title: '无序', action: () => { editor.chain().focus().toggleBulletList().run(); setShowMenu(false); } },
        { icon: <ListOrdered size={15} />, title: '有序', action: () => { editor.chain().focus().toggleOrderedList().run(); setShowMenu(false); } },
        { icon: <CheckSquare size={15} />, title: '任务', action: () => { editor.chain().focus().toggleList('taskList', 'taskItem').run(); setShowMenu(false); } },
      ],
    },
    {
      title: '高级',
      items: [
        { icon: <Quote size={15} />, title: '引用', action: () => { editor.chain().focus().toggleBlockquote().run(); setShowMenu(false); } },
        { icon: <Code size={15} />, title: '代码', action: () => { editor.chain().focus().toggleCodeBlock().run(); setShowMenu(false); } },
      ],
    },
  ];

  if (!isVisible) return null;

  return (
    <div
      className="absolute z-30"
      style={{
        top: menuPosition.top,
        left: menuPosition.left,
      }}
    >
      {/* 加号按钮 */}
      <button
        ref={buttonRef}
        onClick={() => setShowMenu(!showMenu)}
        onMouseEnter={() => {
          if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
          }
        }}
        className="w-7 h-7 flex items-center justify-center rounded-md text-text-muted hover:text-text-secondary hover:bg-hover-bg transition-all duration-150 opacity-70 hover:opacity-100"
        title="点击转换段落类型"
      >
        <Plus size={18} />
      </button>

      {/* 弹出菜单 - 网格布局 */}
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute left-0 top-full mt-1 z-50 bg-page-bg border border-border rounded-xl shadow-xl p-3 animate-fade-in"
          style={{ width: '280px' }}
          onMouseEnter={() => {
            if (hideTimeoutRef.current) {
              clearTimeout(hideTimeoutRef.current);
            }
          }}
        >
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-3' : ''}>
              <div className="text-[11px] font-medium text-text-muted mb-1.5 px-1">
                {section.title}
              </div>
              <div className="grid grid-cols-3 gap-1">
                {section.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg hover:bg-hover-bg transition-colors duration-75"
                    onClick={item.action}
                  >
                    <span className="w-8 h-8 flex items-center justify-center rounded-md bg-hover-bg text-text-secondary">
                      {item.icon}
                    </span>
                    <span className="text-[11px] text-text-secondary">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
