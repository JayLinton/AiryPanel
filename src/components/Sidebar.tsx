import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Trash2,
  FileText,
  Sun,
  Moon,
  Search,
  X,
  GripVertical,
  Star,
  RotateCcw,
  Trash,
  ChevronDown,
  Settings,
  Info,
  BarChart3,
  LogOut,
  Zap,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { notesAPI } from '@/api/client';
import TagFilter from './TagFilter';
import TemplatePicker from './TemplatePicker';
import StatsPanel from './StatsPanel';
import InstallGuide from './InstallGuide';
import { countReferences } from '@/utils/references';
import { isTimelineNote } from '@/utils/timeline';
import type { Template } from '@/types';

const MIN_WIDTH = 200;
const MAX_WIDTH = 350;
const DEFAULT_WIDTH = 260;

export default function Sidebar({ onNavigate, onSelectDoc }: { onNavigate?: (path: string) => void; onSelectDoc?: (id: string) => void } = {}) {
  const {
    state,
    dispatch,
    createDocument,
    softDeleteDocument,
    restoreDocument,
    permanentDeleteDocument,
    toggleFavorite,
    updateAccessTime,
    toggleTheme,
    logout,
  } = useApp();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [isFavoriteCollapsed, setIsFavoriteCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; email: string } | null>(null);
  const [userAvatar, setUserAvatar] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭设置菜单
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
        setEditingUsername(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 获取当前用户信息
  useEffect(() => {
    import('@/api/client').then(({ authAPI }) => {
      authAPI.getMe().then(user => {
        setCurrentUser(user);
        setNewUsername(user.username);
        // 从服务器加载头像
        setUserAvatar(user.avatar || '');
      }).catch(() => {});
    });
  }, []);

  // 编辑时自动聚焦
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  // 侧边栏宽度拖拽
  useEffect(() => {
    if (!isResizing) return;

    function handleMouseMove(e: MouseEvent) {
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
      setSidebarWidth(newWidth);
    }

    function handleMouseUp() {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // 从 TipTap JSON 提取纯文本
  const extractText = useCallback((node: Record<string, unknown>): string => {
    if (node.type === 'text') {
      return (node.text as string) || '';
    }
    if (Array.isArray(node.content)) {
      return node.content.map((child: Record<string, unknown>) => extractText(child)).join('');
    }
    return '';
  }, []);

  // 计算引用计数
  const referenceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    state.documents.forEach((doc) => {
      counts[doc.id] = countReferences(doc.id, state.documents);
    });
    return counts;
  }, [state.documents]);

  // 活跃文档（未删除，排除时间轴笔记）
  const activeDocs = useMemo(() => {
    return state.documents.filter((doc) => !doc.deletedAt && !isTimelineNote(doc.title));
  }, [state.documents]);

  // 收藏文档（最多 5 个）
  const favoriteDocs = useMemo(() => {
    return activeDocs
      .filter((doc) => doc.isFavorite)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5);
  }, [activeDocs]);

  // 已删除文档
  const deletedDocs = useMemo(() => {
    return state.documents
      .filter((doc) => doc.deletedAt)
      .sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
  }, [state.documents]);

  // 过滤文档列表
  const filteredDocs = useMemo(() => {
    const docsToFilter = state.showTrash ? deletedDocs : activeDocs;

    return docsToFilter.filter((doc) => {
      if (state.filterTag && !doc.tags?.includes(state.filterTag)) {
        return false;
      }
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      const titleMatch = doc.title.toLowerCase().includes(query);

      let contentMatch = false;
      if (doc.content) {
        try {
          const content = JSON.parse(doc.content);
          const text = extractText(content);
          contentMatch = text.toLowerCase().includes(query);
        } catch {
          contentMatch = false;
        }
      }

      return titleMatch || contentMatch;
    });
  }, [state.showTrash, deletedDocs, activeDocs, state.filterTag, searchQuery, extractText]);

  // 高亮匹配文字
  function highlightText(text: string, query: string): React.ReactNode {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return (
          <span key={index} className="bg-yellow-200/50 dark:bg-yellow-900/50 rounded px-0.5">
            {part}
          </span>
        );
      }
      return part;
    });
  }

  // 获取内容预览
  function getContentPreview(doc: { content?: string; title: string }, query: string): string | null {
    if (!query.trim() || !doc.content) return null;

    try {
      const content = JSON.parse(doc.content);
      const text = extractText(content);
      const lowerText = text.toLowerCase();
      const lowerQuery = query.toLowerCase();
      const index = lowerText.indexOf(lowerQuery);

      if (index === -1) return null;

      const start = Math.max(0, index - 20);
      const end = Math.min(text.length, index + query.length + 40);
      let preview = text.slice(start, end);

      if (start > 0) preview = '...' + preview;
      if (end < text.length) preview = preview + '...';

      return preview;
    } catch {
      return null;
    }
  }

  // 搜索框 Esc 清空
  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setSearchQuery('');
      searchRef.current?.blur();
    }
  }

  // 开始编辑标题
  function startEditing(doc: { id: string; title: string }) {
    setEditingId(doc.id);
    setEditTitle(doc.title === '未命名笔记' ? '' : doc.title);
  }

  // 保存标题
  async function saveTitle(id: string) {
    const title = editTitle.trim() || '未命名笔记';
    dispatch({ type: 'UPDATE_DOCUMENT', payload: { id, updates: { title } } });
    setEditingId(null);
    try {
      await notesAPI.update(id, { title });
    } catch (error) {
      console.error('保存标题失败:', error);
    }
  }

  // 删除文档（软删除）
  async function handleDelete(id: string) {
    try {
      await softDeleteDocument(id);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('删除文档失败:', error);
    }
  }

  // 恢复文档
  async function handleRestore(id: string) {
    try {
      await restoreDocument(id);
    } catch (error) {
      console.error('恢复文档失败:', error);
    }
  }

  // 永久删除
  async function handlePermanentDelete(id: string) {
    try {
      await permanentDeleteDocument(id);
    } catch (error) {
      console.error('永久删除失败:', error);
    }
  }

  // 新建文档（显示模板选择器）
  function handleCreate() {
    setShowTemplatePicker(true);
  }

  // 处理模板选择
  async function handleTemplateSelect(template: Template) {
    try {
      const docId = await createDocument();
      // 更新文档内容为模板内容
      dispatch({
        type: 'UPDATE_DOCUMENT',
        payload: { id: docId, updates: { content: template.content, title: template.name === '空白文档' ? '未命名笔记' : template.name } },
      });
      await notesAPI.update(docId, {
        content: template.content,
        title: template.name === '空白文档' ? '未命名笔记' : template.name,
      });
      setShowTemplatePicker(false);
    } catch (error) {
      console.error('创建文档失败:', error);
    }
  }

  // 选择文档
  function handleSelectDoc(id: string) {
    dispatch({ type: 'SET_CURRENT_DOC', payload: id });
    updateAccessTime(id);
    onSelectDoc?.(id);
  }

  // 格式化时间
  function formatTime(timestamp: number | string): string {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // 如果时间无效或在未来，返回空
    if (isNaN(date.getTime()) || diff < 0) return '';

    const days = Math.floor(diff / 86400000);

    if (days === 0) {
      return '今天';
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days} 天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  }

  // 渲染文档项
  function renderDocItem(doc: { id: string; title: string; icon?: string; isFavorite?: boolean; updatedAt: number; deletedAt?: number; content?: string }) {
    const contentPreview = getContentPreview(doc, searchQuery);
    const isDeleteConfirming = deleteConfirmId === doc.id;
    const isTrashView = state.showTrash;

    return (
      <div
        key={doc.id}
        className={`group relative flex items-start gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-150 ${
          state.currentDocId === doc.id
            ? 'bg-active-bg'
            : 'hover:bg-hover-bg'
        } ${isDeleteConfirming ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}
        onClick={() => isTrashView ? null : handleSelectDoc(doc.id)}
      >
        {/* 文档图标 */}
        <div className={`mt-0.5 flex-shrink-0 ${
          doc.icon ? 'text-lg' : state.currentDocId === doc.id ? 'text-accent' : 'text-text-muted'
        }`}>
          {doc.icon ? (
            <span>{doc.icon}</span>
          ) : (
            <FileText size={18} strokeWidth={1.5} />
          )}
        </div>

        {/* 文档信息 */}
        <div className="flex-1 min-w-0">
          {editingId === doc.id ? (
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => saveTitle(doc.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveTitle(doc.id);
                if (e.key === 'Escape') setEditingId(null);
              }}
              className="w-full bg-transparent border-none outline-none text-sm text-text-primary font-medium"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <span
                className="text-sm font-medium truncate text-text-primary"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  startEditing(doc);
                }}
              >
                {searchQuery ? highlightText(doc.title, searchQuery) : doc.title}
              </span>
              {referenceCounts[doc.id] > 0 && (
                <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium bg-accent-light text-accent rounded-full">
                  {referenceCounts[doc.id]}
                </span>
              )}
            </div>
          )}

          {/* 内容预览 */}
          {searchQuery && contentPreview ? (
            <div className="text-xs text-text-tertiary mt-1 line-clamp-2 leading-relaxed">
              {highlightText(contentPreview, searchQuery)}
            </div>
          ) : (
            <div className="text-xs text-text-muted mt-1">
              {isTrashView ? `删除于 ${formatTime(doc.deletedAt || 0)}` : formatTime(doc.updatedAt)}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        {isTrashView ? (
          <div className="flex items-center gap-1 mt-0.5">
            <button
              className="p-1.5 text-text-muted hover:text-accent rounded-md transition-colors duration-150"
              onClick={(e) => {
                e.stopPropagation();
                handleRestore(doc.id);
              }}
              data-tooltip="恢复"
            >
              <RotateCcw size={14} />
            </button>
            <button
              className="p-1.5 text-text-muted hover:text-red-500 rounded-md transition-colors duration-150"
              onClick={(e) => {
                e.stopPropagation();
                handlePermanentDelete(doc.id);
              }}
              data-tooltip="永久删除"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : (
          <>
            {/* 收藏按钮 */}
            <button
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(doc.id);
              }}
              data-tooltip={doc.isFavorite ? '取消收藏' : '收藏'}
            >
              <Star
                size={14}
                className={doc.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-text-muted'}
              />
            </button>

            {/* 删除按钮 */}
            {isDeleteConfirming ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <button
                  className="px-2 py-1 text-xs font-medium text-red-500 bg-red-100 dark:bg-red-900/30 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-150"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(doc.id);
                  }}
                >
                  确认
                </button>
                <button
                  className="px-2 py-1 text-xs text-text-tertiary hover:text-text-secondary rounded-md transition-colors duration-150"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmId(null);
                  }}
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-red-500 rounded-md transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirmId(doc.id);
                }}
                data-tooltip="删除"
              >
                <Trash2 size={14} />
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  if (!state.sidebarOpen) {
    return null;
  }

  return (
    <aside
      ref={sidebarRef}
      className="border-r border-border flex flex-col h-screen select-none relative"
      style={{ width: sidebarWidth, backgroundColor: 'var(--sidebar-bg)' }}
    >
      {/* 顶部区域 */}
      <div className="px-4 pt-5 pb-3">
        {/* Logo/标题 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="currentColor" className="text-accent"/>
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-text-primary tracking-tight">Inkflow</h1>
          </div>

          {/* 设置按钮 */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-text-tertiary hover:text-text-secondary rounded-lg transition-colors duration-150"
            >
              <Settings size={16} />
            </button>

            {/* 设置菜单 */}
            {showSettings && (
              <div className="absolute left-0 top-full mt-1 z-50 bg-page-bg border border-border rounded-xl shadow-lg py-2 min-w-[200px] animate-fade-in">
                {/* 用户信息 */}
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    {/* 隐藏的文件上传 */}
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // 限制文件大小 (2MB)
                        if (file.size > 2 * 1024 * 1024) {
                          alert('图片大小不能超过 2MB');
                          return;
                        }

                        const reader = new FileReader();
                        reader.onload = async () => {
                          if (typeof reader.result === 'string') {
                            try {
                              const { authAPI } = await import('@/api/client');
                              const result = await authAPI.updateAvatar(reader.result);
                              setUserAvatar(result.avatar);
                            } catch (error) {
                              console.error('上传头像失败:', error);
                              alert('上传头像失败，请重试');
                            }
                          }
                        };
                        reader.readAsDataURL(file);

                        // 重置 input
                        if (avatarInputRef.current) {
                          avatarInputRef.current.value = '';
                        }
                      }}
                    />

                    <div
                      className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-accent-ring transition-all overflow-hidden"
                      onClick={() => avatarInputRef.current?.click()}
                      title="点击上传头像"
                    >
                      {userAvatar ? (
                        <img src={userAvatar} alt="头像" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-semibold text-accent">
                          {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingUsername ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className="flex-1 text-sm bg-hover-bg border border-border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-accent-ring"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setEditingUsername(false);
                              }
                              if (e.key === 'Escape') {
                                setEditingUsername(false);
                                setNewUsername(currentUser?.username || '');
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          className="text-sm font-medium text-text-primary cursor-pointer hover:text-accent transition-colors"
                          onClick={() => setEditingUsername(true)}
                          title="点击修改用户名"
                        >
                          {currentUser?.username || '用户'}
                        </div>
                      )}
                      <div className="text-xs text-text-muted">{currentUser?.email || ''}</div>
                    </div>
                  </div>
                </div>

                {/* 深色模式 */}
                <button
                  onClick={() => {
                    toggleTheme();
                    setShowSettings(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-hover-bg transition-colors duration-150"
                >
                  {state.theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                  <span>{state.theme === 'light' ? '深色模式' : '浅色模式'}</span>
                </button>

                {/* 数据统计 */}
                <button
                  onClick={() => {
                    setShowSettings(false);
                    setShowStats(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-hover-bg transition-colors duration-150"
                >
                  <BarChart3 size={16} />
                  <span>数据统计</span>
                </button>

                {/* 帮助与反馈 */}
                <button
                  onClick={() => {
                    setShowSettings(false);
                    window.open('https://github.com/JayLinton/Inkflow', '_blank');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-hover-bg transition-colors duration-150"
                >
                  <Info size={16} />
                  <span>帮助与反馈</span>
                </button>

                {/* 退出登录 */}
                <div className="border-t border-border my-1" />
                <button
                  onClick={() => {
                    setShowSettings(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                >
                  <LogOut size={16} />
                  <span>退出登录</span>
                </button>

                {/* 关于 */}
                <button
                  onClick={() => {
                    setShowSettings(false);
                    setShowAbout(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-hover-bg transition-colors duration-150"
                >
                  <Info size={16} />
                  <span>关于</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="搜索笔记..."
            className="w-full pl-9 pr-9 py-2 text-sm border border-border rounded-lg outline-none placeholder-text-muted text-text-primary transition-all duration-200"
            style={{ backgroundColor: 'var(--hover-bg)' }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                searchRef.current?.focus();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-text-muted hover:text-text-tertiary rounded transition-colors duration-150"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 文档列表区域 */}
      <div className="flex-1 overflow-y-auto px-3 py-1">
        {state.showTrash ? (
          /* 回收站视图 */
          <>
            <div className="px-2 py-2 flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                回收站
              </span>
              <div className="flex items-center gap-2">
                {filteredDocs.length > 0 && (
                  <button
                    onClick={async () => {
                      if (confirm('确定要永久删除所有回收站中的笔记吗？此操作不可撤销。')) {
                        for (const doc of filteredDocs) {
                          await permanentDeleteDocument(doc.id);
                        }
                      }
                    }}
                    className="text-xs text-red-500 hover:text-red-600 transition-colors"
                  >
                    清空
                  </button>
                )}
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_TRASH' })}
                  className="text-xs text-accent hover:underline"
                >
                  返回
                </button>
              </div>
            </div>
            {filteredDocs.length === 0 ? (
              <div className="px-2 py-10 text-center">
                <Trash size={24} className="text-text-muted mx-auto mb-3" />
                <p className="text-sm text-text-muted">回收站为空</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredDocs.map(renderDocItem)}
              </div>
            )}
          </>
        ) : (
          /* 正常视图 */
          <>
            {/* 收藏区域 */}
            {favoriteDocs.length > 0 && !searchQuery && (
              <div className="mb-2">
                <button
                  onClick={() => setIsFavoriteCollapsed(!isFavoriteCollapsed)}
                  className="w-full px-2 py-2 flex items-center gap-1.5 hover:bg-hover-bg rounded-md transition-colors duration-150"
                >
                  <ChevronDown
                    size={12}
                    className={`text-text-muted transition-transform duration-200 ${isFavoriteCollapsed ? '-rotate-90' : ''}`}
                  />
                  <Star size={12} className="text-text-muted" />
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                    收藏
                  </span>
                  <span className="text-xs text-text-muted ml-auto">{favoriteDocs.length}</span>
                </button>
                {!isFavoriteCollapsed && (
                  <div className="space-y-0.5">
                    {favoriteDocs.map(renderDocItem)}
                  </div>
                )}
              </div>
            )}

            {/* 所有笔记 */}
            <div className="px-2 py-2 flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                {searchQuery ? '搜索结果' : '所有笔记'}
              </span>
              {searchQuery && (
                <span className="text-xs text-text-muted">
                  {filteredDocs.length} 个结果
                </span>
              )}
            </div>

            {filteredDocs.length === 0 ? (
              <div className="px-2 py-10 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--hover-bg)' }}>
                  {searchQuery ? (
                    <Search size={24} className="text-text-muted" />
                  ) : (
                    <Plus size={24} className="text-text-muted" />
                  )}
                </div>
                <p className="text-sm text-text-tertiary mb-1">
                  {searchQuery ? '未找到相关笔记' : '暂无笔记'}
                </p>
                {searchQuery ? (
                  <p className="text-xs text-text-muted">尝试其他关键词</p>
                ) : (
                  <button
                    onClick={handleCreate}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent-light rounded-lg transition-colors duration-150"
                  >
                    <Plus size={14} />
                    新建笔记
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredDocs.map(renderDocItem)}
              </div>
            )}
          </>
        )}
      </div>

      {/* 标签筛选 */}
      {!state.showTrash && <TagFilter />}

      {/* 灵感入口 */}
      {!state.showTrash && (
        <div className="px-3 pb-1">
          <button
            onClick={() => onNavigate?.('/timeline')}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-tertiary hover:text-text-secondary hover:bg-hover-bg rounded-lg transition-colors duration-150"
          >
            <Zap size={15} />
            灵感
          </button>
        </div>
      )}

      {/* 底部操作区 */}
      <div className="p-3 border-t border-border space-y-1.5">
        <button
          onClick={handleCreate}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-accent bg-accent-light hover:bg-accent/20 border border-accent/30 rounded-lg transition-all duration-200"
          data-tooltip="新建笔记 (⌘N)"
        >
          <Plus size={16} />
          新建笔记
        </button>

        <button
          onClick={() => dispatch({ type: 'TOGGLE_TRASH' })}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            state.showTrash
              ? 'text-accent bg-accent-light'
              : 'text-text-muted hover:text-text-tertiary hover:bg-hover-bg'
          }`}
          data-tooltip="回收站"
        >
          <Trash2 size={15} />
          回收站 {deletedDocs.length > 0 && `(${deletedDocs.length})`}
        </button>

      </div>

      {/* 拖拽调整宽度条 */}
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize group hover:bg-accent/30 transition-colors duration-150"
        onMouseDown={() => setIsResizing(true)}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <GripVertical size={12} className="text-text-muted" />
        </div>
      </div>

      {/* 关于弹窗 */}
      {showAbout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowAbout(false)}
          />
          <div className="relative bg-page-bg border border-border rounded-2xl shadow-2xl w-full max-w-[360px] mx-4 animate-slide-up overflow-hidden">
            {/* 头部 */}
            <div className="px-6 pt-8 pb-6 text-center bg-gradient-to-b from-accent-light to-transparent">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent flex items-center justify-center shadow-lg">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4h16v2H4V4zm0 7h16v2H4v-2zm0 7h16v2H4v-2z" fill="white"/>
                  <circle cx="8" cy="8" r="2" fill="white"/>
                  <circle cx="16" cy="16" r="2" fill="white"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-1">Inkflow</h2>
              <p className="text-sm text-text-tertiary">优雅的本地笔记应用</p>
            </div>

            {/* 内容 */}
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-tertiary">版本</span>
                  <span className="text-text-secondary font-medium">0.3.6</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <a
                  href="https://github.com/JayLinton/Inkflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-accent hover:underline"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
              </div>

              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-center gap-4 text-xs">
                  <button
                    onClick={() => {
                      setShowAbout(false);
                      setShowPrivacy(true);
                    }}
                    className="text-text-muted hover:text-accent transition-colors duration-150"
                  >
                    隐私政策
                  </button>
                  <span className="text-text-muted">·</span>
                  <button
                    onClick={() => {
                      setShowAbout(false);
                      setShowTerms(true);
                    }}
                    className="text-text-muted hover:text-accent transition-colors duration-150"
                  >
                    用户协议
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-xs text-text-muted text-center leading-relaxed">
                  © 2026 Inkflow. All rights reserved.
                </p>
              </div>
            </div>

            {/* 关闭按钮 */}
            <div className="px-6 pb-5">
              <button
                onClick={() => setShowAbout(false)}
                className="w-full py-2.5 text-sm font-medium text-text-secondary bg-hover-bg hover:bg-active-bg rounded-lg transition-colors duration-150"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 模板选择器 */}
      {showTemplatePicker && (
        <TemplatePicker
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}

      {/* 数据统计 */}
      {showStats && (
        <StatsPanel
          documents={state.documents}
          onClose={() => setShowStats(false)}
        />
      )}

      {/* 安装指南 */}
      {showInstallGuide && (
        <InstallGuide onClose={() => setShowInstallGuide(false)} />
      )}

      {/* 隐私政策弹窗 */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => {
              setShowPrivacy(false);
              setShowAbout(true);
            }}
          />
          <div className="relative bg-page-bg border border-border rounded-2xl shadow-2xl w-full max-w-[500px] mx-4 animate-slide-up overflow-hidden max-h-[80vh] flex flex-col">
            {/* 头部 */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">隐私政策</h2>
              <button
                onClick={() => {
                  setShowPrivacy(false);
                  setShowAbout(true);
                }}
                className="p-1.5 text-text-muted hover:text-text-secondary rounded-lg transition-colors duration-150"
              >
                <X size={18} />
              </button>
            </div>

            {/* 内容 */}
            <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4 text-sm text-text-secondary leading-relaxed">
              <p>
                Inkflow（以下简称"我们"）尊重并保护您的隐私。本隐私政策说明了我们如何收集、使用和保护您的个人信息。
              </p>

              <h3 className="text-base font-semibold text-text-primary pt-2">信息收集与使用</h3>
              <p>
                Inkflow 是一款本地优先的笔记应用。您的所有笔记数据均存储在您的设备本地（浏览器 IndexedDB），我们不会收集、上传或存储您的任何笔记内容。
              </p>

              <h3 className="text-base font-semibold text-text-primary pt-2">本地存储</h3>
              <p>
                应用使用浏览器的 IndexedDB 技术进行数据存储。所有数据仅保存在您的设备上，不会传输到任何外部服务器。您可以随时通过应用内的导出功能备份您的数据。
              </p>

              <h3 className="text-base font-semibold text-text-primary pt-2">第三方服务</h3>
              <p>
                本应用不集成任何第三方分析、广告或追踪服务。我们不会向任何第三方分享您的个人信息。
              </p>

              <h3 className="text-base font-semibold text-text-primary pt-2">数据安全</h3>
              <p>
                我们采用业界标准的安全措施保护您的本地数据。但由于数据存储在您的浏览器中，建议您定期导出备份以防数据丢失。
              </p>

              <h3 className="text-base font-semibold text-text-primary pt-2">隐私政策更新</h3>
              <p>
                我们可能会不时更新本隐私政策。更新后的政策将在应用内发布，继续使用本应用即表示您同意更新后的隐私政策。
              </p>

              <h3 className="text-base font-semibold text-text-primary pt-2">联系我们</h3>
              <p>
                如果您对本隐私政策有任何疑问，请通过 GitHub 与我们联系。
              </p>

              <p className="text-xs text-text-muted pt-4">
                最后更新日期：2026 年 5 月 31 日
              </p>
            </div>

            {/* 关闭按钮 */}
            <div className="px-6 py-4 border-t border-border">
              <button
                onClick={() => {
                  setShowPrivacy(false);
                  setShowAbout(true);
                }}
                className="w-full py-2.5 text-sm font-medium text-text-secondary bg-hover-bg hover:bg-active-bg rounded-lg transition-colors duration-150"
              >
                我已了解
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 用户协议弹窗 */}
      {showTerms && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => {
              setShowTerms(false);
              setShowAbout(true);
            }}
          />
          <div className="relative bg-page-bg border border-border rounded-2xl shadow-2xl w-full max-w-[500px] mx-4 animate-slide-up overflow-hidden max-h-[80vh] flex flex-col">
            {/* 头部 */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">用户协议</h2>
              <button
                onClick={() => {
                  setShowTerms(false);
                  setShowAbout(true);
                }}
                className="p-1.5 text-text-muted hover:text-text-secondary rounded-lg transition-colors duration-150"
              >
                <X size={18} />
              </button>
            </div>

            {/* 内容 */}
            <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4 text-sm text-text-secondary leading-relaxed">
              <p>
                欢迎使用 Inkflow。在使用本应用之前，请仔细阅读以下用户协议。
              </p>

              <h3 className="text-base font-semibold text-text-primary pt-2">服务说明</h3>
              <p>
                Inkflow 是一款本地笔记应用，旨在为您提供纯粹的写作体验。本应用的所有功能均在您的设备本地运行，无需联网即可使用。
              </p>

              <h3 className="text-base font-semibold text-text-primary pt-2">使用规范</h3>
              <p>
                您应合法使用本应用，不得利用本应用存储或传播违反法律法规的内容。您应对自己的笔记内容负全部责任。
              </p>

              <h3 className="text-base font-semibold text-text-primary pt-2">知识产权</h3>
              <p>
                本应用的源代码基于 MIT 开源协议发布。您在使用本应用时创建的笔记内容归您所有。
              </p>

              <h3 className="text-base font-semibold text-text-primary pt-2">免责声明</h3>
              <p>
                本应用按"现状"提供，我们不对数据丢失、应用中断等情况承担责任。建议您定期备份重要数据。
              </p>

              <h3 className="text-base font-semibold text-text-primary pt-2">协议更新</h3>
              <p>
                我们保留随时修改本协议的权利。更新后的协议将在应用内发布，继续使用本应用即表示您同意更新后的协议。
              </p>

              <h3 className="text-base font-semibold text-text-primary pt-2">联系我们</h3>
              <p>
                如果您对本用户协议有任何疑问，请通过 GitHub 与我们联系。
              </p>

              <p className="text-xs text-text-muted pt-4">
                最后更新日期：2026 年 5 月 31 日
              </p>
            </div>

            {/* 关闭按钮 */}
            <div className="px-6 py-4 border-t border-border">
              <button
                onClick={() => {
                  setShowTerms(false);
                  setShowAbout(true);
                }}
                className="w-full py-2.5 text-sm font-medium text-text-secondary bg-hover-bg hover:bg-active-bg rounded-lg transition-colors duration-150"
              >
                我已了解
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
