import { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { common, createLowlight } from 'lowlight';
import Mathematics from '@tiptap/extension-mathematics';
import { ImageResize } from '@/extensions/ImageResize';
import {
  Plus,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Image as ImageIcon,
  ChevronDown,
  Paintbrush,
  Focus,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { notesAPI } from '@/api/client';
import TitleInput from './TitleInput';
import DocToolbar from './DocToolbar';
import TagInput from './TagInput';
import ErrorBanner from './ErrorBanner';
import BlockMenu from './BlockMenu';

// 懒加载非关键组件
const CommandMenu = lazy(() => import('./CommandMenu'));
const DocumentPicker = lazy(() => import('./DocumentPicker'));
const OutlinePanel = lazy(() => import('./OutlinePanel'));
const FocusMode = lazy(() => import('./FocusMode'));

// 创建 lowlight 实例
const lowlight = createLowlight(common);

// 防抖函数
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 文字颜色列表
const TEXT_COLORS = [
  { name: '默认', value: 'var(--text-primary)' },
  { name: '灰色', value: '#6b7280' },
  { name: '红色', value: '#ef4444' },
  { name: '橙色', value: '#f97316' },
  { name: '黄色', value: '#ca8a04' },
  { name: '绿色', value: '#16a34a' },
  { name: '蓝色', value: '#2563eb' },
  { name: '紫色', value: '#9333ea' },
  { name: '粉色', value: '#db2777' },
];

// 文字背景颜色列表
const HIGHLIGHT_COLORS = [
  { name: '无', value: 'transparent' },
  { name: '黄色', value: '#fef08a' },
  { name: '绿色', value: '#bbf7d0' },
  { name: '蓝色', value: '#bfdbfe' },
  { name: '紫色', value: '#e9d5ff' },
  { name: '粉色', value: '#fbcfe8' },
  { name: '橙色', value: '#fed7aa' },
  { name: '红色', value: '#fecaca' },
  { name: '灰色', value: '#e5e7eb' },
];

export default function Editor() {
  const { state, dispatch, createDocument } = useApp();
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [showDocPicker, setShowDocPicker] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 当前文档
  const currentDoc = useMemo(
    () => state.documents.find((doc) => doc.id === state.currentDocId),
    [state.documents, state.currentDocId]
  );

  // 保存内容到服务器
  const saveContent = useCallback(
    async (content: string) => {
      if (!state.currentDocId) return;

      try {
        dispatch({
          type: 'UPDATE_DOCUMENT',
          payload: { id: state.currentDocId, updates: { content, updatedAt: Date.now() } },
        });

        await notesAPI.update(state.currentDocId, { content });
      } catch (error) {
        console.error('保存内容失败:', error);
      }
    },
    [state.currentDocId, dispatch]
  );

  // 防抖保存（800ms）
  const debouncedSave = useMemo(
    () => debounce((content: string) => saveContent(content), 800),
    [saveContent]
  );

  // 处理粘贴和拖拽图片
  const handleImageUpload = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  // 初始化编辑器
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return '输入标题...';
          }
          return '输入 / 查看命令，或开始写作...';
        },
      }),
      Typography,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
      }),
      ImageResize,
      Mathematics,
      TextStyle,
      Color,
    ],
    content: currentDoc?.content ? JSON.parse(currentDoc.content) : '',
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      debouncedSave(JSON.stringify(json));
    },
    editorProps: {
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find((item) => item.type.startsWith('image/'));

        if (imageItem) {
          event.preventDefault();
          const file = imageItem.getAsFile();
          if (file) {
            handleImageUpload(file).then((base64) => {
              const { state } = view;
              const { $from } = state.selection;
              view.dispatch(
                view.state.tr.insert(
                  $from.pos,
                  view.state.schema.nodes.image.create({ src: base64 })
                )
              );
            });
          }
          return true;
        }
        return false;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;

        const files = Array.from(event.dataTransfer?.files || []);
        const imageFile = files.find((file) => file.type.startsWith('image/'));

        if (imageFile) {
          event.preventDefault();
          handleImageUpload(imageFile).then((base64) => {
            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });
            if (coordinates) {
              view.dispatch(
                view.state.tr.insert(
                  coordinates.pos,
                  view.state.schema.nodes.image.create({ src: base64 })
                )
              );
            }
          });
          return true;
        }
        return false;
      },
      handleKeyDown: (view, event) => {
        if (event.key === '[' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
          const { state } = view;
          const { $from } = state.selection;
          const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
          const isInCodeBlock = $from.parent.type.name === 'codeBlock';

          if (!isInCodeBlock && textBefore.endsWith('[')) {
            setTimeout(() => setShowDocPicker(true), 10);
          }
        }

        if (event.key === '/' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
          const { state } = view;
          const { $from } = state.selection;
          const isInCodeBlock = $from.parent.type.name === 'codeBlock';

          if (!isInCodeBlock) {
            setTimeout(() => setShowCommandMenu(true), 10);
          }
        }

        if (event.key === 'Tab' && view.state.selection.$from.parent.type.name === 'codeBlock') {
          event.preventDefault();
          const { state } = view;
          const { $from } = state.selection;
          const isInCodeBlock = $from.parent.type.name === 'codeBlock';

          if (isInCodeBlock) {
            view.dispatch(state.tr.insertText('  ', $from.pos));
          }
          return true;
        }
      },
    },
  });

  // 处理本地图片上传
  const handleLocalImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 处理图片文件选择
  const handleImageFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          editor?.chain().focus().setImage({ src: reader.result }).run();
        }
      };
      reader.readAsDataURL(file);

      // 重置 input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [editor]
  );

  // 切换文档时更新编辑器内容
  useEffect(() => {
    if (editor && currentDoc) {
      const content = currentDoc.content ? JSON.parse(currentDoc.content) : '';
      editor.commands.setContent(content);
    }
  }, [currentDoc?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // 手动保存
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (editor && state.currentDocId) {
          const json = editor.getJSON();
          saveContent(JSON.stringify(json));
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor, state.currentDocId, saveContent]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = () => {
      setShowColorMenu(false);
      setShowHighlightMenu(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // 空状态
  if (!currentDoc) {
    return (
      <div className="flex-1 flex items-center justify-center bg-editor-bg animate-fade-in">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="16" y="8" width="64" height="80" rx="4" stroke="#e5e5e5" strokeWidth="2"/>
              <line x1="32" y1="24" x2="64" y2="24" stroke="#e5e5e5" strokeWidth="2" strokeLinecap="round"/>
              <line x1="32" y1="36" x2="56" y2="36" stroke="#e5e5e5" strokeWidth="2" strokeLinecap="round"/>
              <line x1="32" y1="48" x2="60" y2="48" stroke="#e5e5e5" strokeWidth="2" strokeLinecap="round"/>
              <line x1="32" y1="60" x2="52" y2="60" stroke="#e5e5e5" strokeWidth="2" strokeLinecap="round"/>
              <rect x="20" y="16" width="8" height="64" rx="2" fill="#f7f6f3"/>
            </svg>
          </div>
          <h2 className="text-lg font-medium text-text-tertiary mb-2">开始你的第一篇笔记</h2>
          <p className="text-sm text-text-muted mb-6">点击左侧 + 新建笔记，或按下 Cmd+N</p>
          <button
            onClick={() => createDocument()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-md transition-all duration-150 hover:shadow-md"
          >
            <Plus size={16} />
            新建笔记
          </button>
        </div>
      </div>
    );
  }

  // 顶部工具栏工具列表
  const toolbarTools = [
    {
      icon: <Bold size={16} />,
      title: '粗体',
      shortcut: '⌘B',
      action: () => editor?.chain().focus().toggleBold().run(),
      isActive: () => editor?.isActive('bold') || false,
    },
    {
      icon: <Italic size={16} />,
      title: '斜体',
      shortcut: '⌘I',
      action: () => editor?.chain().focus().toggleItalic().run(),
      isActive: () => editor?.isActive('italic') || false,
    },
    {
      icon: <UnderlineIcon size={16} />,
      title: '下划线',
      shortcut: '⌘U',
      action: () => editor?.chain().focus().toggleUnderline().run(),
      isActive: () => editor?.isActive('underline') || false,
    },
    {
      icon: <Strikethrough size={16} />,
      title: '删除线',
      action: () => editor?.chain().focus().toggleStrike().run(),
      isActive: () => editor?.isActive('strike') || false,
    },
    { type: 'divider' },
    {
      icon: <Heading1 size={16} />,
      title: '标题 1',
      shortcut: '#',
      action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor?.isActive('heading', { level: 1 }) || false,
    },
    {
      icon: <Heading2 size={16} />,
      title: '标题 2',
      shortcut: '##',
      action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor?.isActive('heading', { level: 2 }) || false,
    },
    {
      icon: <Heading3 size={16} />,
      title: '标题 3',
      shortcut: '###',
      action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor?.isActive('heading', { level: 3 }) || false,
    },
    { type: 'divider' },
    {
      icon: <List size={16} />,
      title: '无序列表',
      shortcut: '-',
      action: () => editor?.chain().focus().toggleBulletList().run(),
      isActive: () => editor?.isActive('bulletList') || false,
    },
    {
      icon: <ListOrdered size={16} />,
      title: '有序列表',
      shortcut: '1.',
      action: () => editor?.chain().focus().toggleOrderedList().run(),
      isActive: () => editor?.isActive('orderedList') || false,
    },
    {
      icon: <CheckSquare size={16} />,
      title: '任务列表',
      shortcut: '[]',
      action: () => editor?.chain().focus().toggleList('taskList', 'taskItem').run(),
      isActive: () => editor?.isActive('taskList') || false,
    },
    { type: 'divider' },
    {
      icon: <Code size={16} />,
      title: '行内代码',
      action: () => editor?.chain().focus().toggleCode().run(),
      isActive: () => editor?.isActive('code') || false,
    },
    {
      icon: <LinkIcon size={16} />,
      title: '链接',
      shortcut: '⌘K',
      action: () => {
        const url = window.prompt('输入链接地址:');
        if (url) {
          editor?.chain().focus().setLink({ href: url.startsWith('http') ? url : `https://${url}` }).run();
        }
      },
      isActive: () => editor?.isActive('link') || false,
    },
    { type: 'divider' },
    {
      icon: <Quote size={16} />,
      title: '引用',
      shortcut: '>',
      action: () => editor?.chain().focus().toggleBlockquote().run(),
      isActive: () => editor?.isActive('blockquote') || false,
    },
    {
      icon: <Minus size={16} />,
      title: '分隔线',
      shortcut: '---',
      action: () => editor?.chain().focus().setHorizontalRule().run(),
      isActive: () => false,
    },
    {
      icon: <ImageIcon size={16} />,
      title: '插入图片',
      action: handleLocalImageUpload,
      isActive: () => false,
    },
  ];

  return (
    <div className="flex-1 bg-editor-bg animate-fade-in flex flex-col overflow-hidden">
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* 固定顶部工具栏 - 毛玻璃效果 */}
      <div className="shrink-0 relative z-50 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-black/5 dark:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center h-11 gap-1">
            {/* 文字颜色 */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorMenu(!showColorMenu);
                  setShowHighlightMenu(false);
                }}
                className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-text-tertiary hover:text-text-secondary hover:bg-hover-bg rounded-md transition-all duration-150 whitespace-nowrap"
                title="文字颜色"
              >
                <div className="w-4 h-4 rounded border border-current" style={{ borderBottomWidth: '3px', borderBottomColor: 'var(--text-primary)' }} />
                <ChevronDown size={12} />
              </button>

              {showColorMenu && (
                <div className="absolute left-0 top-full mt-1 z-[60] bg-page-bg border border-border rounded-lg shadow-lg p-2 min-w-[160px] animate-fade-in">
                  <div className="text-xs text-text-muted mb-2 px-1">文字颜色</div>
                  <div className="grid grid-cols-5 gap-1">
                    {TEXT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          editor?.chain().focus().setColor(color.value).run();
                          setShowColorMenu(false);
                        }}
                        className="w-7 h-7 rounded-md border border-border hover:scale-110 transition-transform duration-150 flex items-center justify-center"
                        title={color.name}
                      >
                        <div
                          className="w-5 h-5 rounded"
                          style={{ backgroundColor: color.value }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 文字背景颜色 */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHighlightMenu(!showHighlightMenu);
                  setShowColorMenu(false);
                }}
                className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-text-tertiary hover:text-text-secondary hover:bg-hover-bg rounded-md transition-all duration-150 whitespace-nowrap"
                title="文字背景颜色"
              >
                <Paintbrush size={14} />
                <ChevronDown size={12} />
              </button>

              {showHighlightMenu && (
                <div className="absolute left-0 top-full mt-1 z-[60] bg-page-bg border border-border rounded-lg shadow-lg p-2 min-w-[160px] animate-fade-in">
                  <div className="text-xs text-text-muted mb-2 px-1">背景颜色</div>
                  <div className="grid grid-cols-5 gap-1">
                    {HIGHLIGHT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (color.value === 'transparent') {
                            editor?.chain().focus().unsetHighlight().run();
                          } else {
                            editor?.chain().focus().toggleHighlight({ color: color.value }).run();
                          }
                          setShowHighlightMenu(false);
                        }}
                        className="w-7 h-7 rounded-md border border-border hover:scale-110 transition-transform duration-150 flex items-center justify-center"
                        title={color.name}
                      >
                        <div
                          className="w-5 h-5 rounded"
                          style={{ backgroundColor: color.value === 'transparent' ? '#fff' : color.value }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-border mx-1" />

            {/* 格式工具 */}
            {toolbarTools.map((tool, index) => {
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
                  className={`w-8 h-8 flex items-center justify-center rounded transition-all duration-100 shrink-0 ${
                    tool.isActive?.()
                      ? 'bg-accent-light text-accent'
                      : 'text-text-tertiary hover:bg-hover-bg hover:text-text-secondary'
                  }`}
                >
                  {tool.icon}
                </button>
              );
            })}

            <div className="flex-1" />

            {/* 专注模式 */}
            <button
              onClick={() => setShowFocusMode(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-text-tertiary hover:text-text-secondary hover:bg-hover-bg rounded-md transition-all duration-150"
              title="专注模式"
            >
              <Focus size={14} />
              <span>专注</span>
            </button>

            <div className="w-px h-5 bg-border mx-1" />

            {/* 导入导出 */}
            <DocToolbar editor={editor} />
          </div>
        </div>
      </div>

      {/* 错误提示条 */}
      <ErrorBanner />

      {/* 主内容区：编辑器 + 大纲 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 编辑区 */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1000px] mx-auto py-12 px-[min(48px,4vw)]">
            {/* 标题 */}
            <TitleInput />

            {/* 标签 */}
            <TagInput docId={currentDoc.id} tags={currentDoc.tags || []} />

            {/* 编辑器容器 */}
            <div
              ref={editorContainerRef}
              className="relative mt-4"
            >
              <EditorContent editor={editor} className="tiptap" />

              {/* 块级菜单 */}
              {editor && <BlockMenu editor={editor} />}

              {/* 命令菜单 - 懒加载 */}
              {showCommandMenu && editor && (
                <Suspense fallback={null}>
                  <CommandMenu editor={editor} onClose={() => setShowCommandMenu(false)} />
                </Suspense>
              )}

              {/* 文档选择器（双链） - 懒加载 */}
              {showDocPicker && editor && (
                <Suspense fallback={null}>
                  <DocumentPicker editor={editor} onClose={() => setShowDocPicker(false)} />
                </Suspense>
              )}
            </div>

            {/* 底部留白 */}
            <div className="h-60" />
          </div>
        </div>

        {/* 大纲面板 - 懒加载 */}
        {editor && (
          <Suspense fallback={null}>
            <OutlinePanel editor={editor} />
          </Suspense>
        )}
      </div>

      {/* 专注模式 - 懒加载 */}
      {showFocusMode && editor && (
        <Suspense fallback={null}>
          <FocusMode editor={editor} onClose={() => setShowFocusMode(false)} />
        </Suspense>
      )}
    </div>
  );
}