import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, X, Download, RefreshCw } from 'lucide-react';
import { getStorageStatus, tryRecoverStorage, exportData } from '@/db/database';

interface ErrorDetail {
  message: string;
  details?: string;
  status: string;
}

export default function ErrorBanner() {
  const [error, setError] = useState<ErrorDetail | null>(null);
  const [visible, setVisible] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  // 监听存储错误
  useEffect(() => {
    function handleStorageError(event: CustomEvent<ErrorDetail>) {
      setError(event.detail);
      setVisible(true);
    }

    window.addEventListener('storage-error', handleStorageError as EventListener);

    return () => {
      window.removeEventListener('storage-error', handleStorageError as EventListener);
    };
  }, []);

  // 自动隐藏（15秒后）
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setVisible(false), 15000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // 导出备份
  const handleExport = useCallback(async () => {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inkflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('导出失败:', err);
    }
  }, []);

  // 尝试恢复存储
  const handleRecover = useCallback(async () => {
    setIsRecovering(true);
    try {
      const success = await tryRecoverStorage();
      if (success) {
        setVisible(false);
        setError(null);
      }
    } catch (err) {
      console.error('恢复失败:', err);
    } finally {
      setIsRecovering(false);
    }
  }, []);

  if (!visible || !error) {
    return null;
  }

  const status = getStorageStatus();

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/30 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3 animate-slide-down">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 flex-1">
          <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {error.message}
            </p>
            {error.details && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                {error.details}
              </p>
            )}
            {status.isMemoryFallback && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                当前使用临时存储，数据仅保存在内存中，刷新页面后将丢失。
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* 导出备份按钮 */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800/50 hover:bg-yellow-200 dark:hover:bg-yellow-800 rounded transition-colors duration-150"
            title="导出备份"
          >
            <Download size={12} />
            导出备份
          </button>

          {/* 恢复存储按钮 */}
          {status.isMemoryFallback && (
            <button
              onClick={handleRecover}
              disabled={isRecovering}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800/50 hover:bg-yellow-200 dark:hover:bg-yellow-800 rounded transition-colors duration-150 disabled:opacity-50"
              title="尝试恢复存储"
            >
              <RefreshCw size={12} className={isRecovering ? 'animate-spin' : ''} />
              {isRecovering ? '恢复中...' : '恢复存储'}
            </button>
          )}

          {/* 关闭按钮 */}
          <button
            onClick={() => setVisible(false)}
            className="p-1 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 rounded transition-colors duration-150"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
