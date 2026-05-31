import { useEffect, useState, lazy, Suspense } from 'react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import Sidebar from '@/components/Sidebar';
import Editor from '@/components/Editor';
import StatusBar from '@/components/StatusBar';

// 懒加载非关键组件
const ShortcutPanel = lazy(() => import('@/components/ShortcutPanel'));

function AppContent() {
  const { dispatch, createDocument } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // 页面加载动画
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // 快捷键：Cmd/Ctrl + N 新建文档
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        createDocument();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [createDocument]);

  // 快捷键：Cmd/Ctrl + B 切换侧边栏
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_SIDEBAR' });
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  // 快捷键：Cmd/Ctrl + / 显示快捷键面板
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
      // ? 键也可以打开（不在输入框中时）
      if (e.key === '?' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        setShowShortcuts((prev) => !prev);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 快捷键：Cmd/Ctrl + Shift + F 聚焦搜索框
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        // 找到侧边栏的搜索框并聚焦
        const searchInput = document.querySelector('aside input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className={`flex h-screen overflow-hidden transition-opacity duration-200 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'var(--page-bg)' }}
    >
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0" style={{ backgroundColor: 'var(--sidebar-bg)' }}>
        {/* 编辑器 */}
        <Editor />
      </div>

      {/* 状态栏 - 固定定位 */}
      <StatusBar />

      {/* 快捷键面板 - 懒加载 */}
      {showShortcuts && (
        <Suspense fallback={null}>
          <ShortcutPanel onClose={() => setShowShortcuts(false)} />
        </Suspense>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
