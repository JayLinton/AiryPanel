import { useState, useEffect, useCallback } from 'react';
import { CheckCircle } from 'lucide-react';

// 全局 Toast 事件
export function showToast(message: string, type: 'success' | 'error' = 'success') {
  window.dispatchEvent(new CustomEvent('toast', { detail: { message, type } }));
}

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((e: Event) => {
    const { message, type } = (e as CustomEvent).detail;
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    window.addEventListener('toast', addToast);
    return () => window.removeEventListener('toast', addToast);
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-6 z-[200] flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="flex items-center gap-3 px-4 py-3 bg-page-bg border border-border rounded-xl shadow-lg animate-slide-up min-w-[200px]"
        >
          <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
          <span className="text-sm text-text-primary">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
