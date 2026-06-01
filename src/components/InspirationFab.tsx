import { useState, useRef, useEffect, useCallback } from 'react';
import { Zap, X, Send } from 'lucide-react';
import { notesAPI } from '../api/client';
import { showToast } from './Toast';
import { getTodayDateStr, getDailyTitle, appendToMarkdown } from '../utils/timeline';

export function InspirationFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // 打开时聚焦输入框
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // ESC 关闭
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setText('');
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      const todayStr = getTodayDateStr();
      const dailyTitle = getDailyTitle(todayStr);

      // 获取所有笔记，查找今日时间轴
      const notes = await notesAPI.getAll();
      const todayNote = notes.find(n => n.title === dailyTitle && !n.deletedAt);

      if (todayNote) {
        // 追加到现有时间轴
        const newContent = appendToMarkdown(todayNote.content, trimmed);
        await notesAPI.update(todayNote.id, { content: newContent });
      } else {
        // 创建新的时间轴笔记
        const content = `# ${todayStr}\n\n---\n\n**${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}** ${trimmed}\n`;
        await notesAPI.create({
          title: dailyTitle,
          content,
          icon: '⚡',
          tags: ['时间轴'],
        });
      }

      showToast('已落入今日时间轴');
      setText('');
      // 连续捕获模式：保持输入框打开
    } catch (error) {
      console.error('保存灵感失败:', error);
      showToast('保存失败，请重试', 'error');
    } finally {
      setSending(false);
    }
  }, [text, sending]);

  // Enter 发送，Shift+Enter 换行
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <>
      {/* 悬浮按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        data-tooltip="灵感捕获"
        className="w-14 h-14 rounded-full bg-accent text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        style={{ outline: 'none' }}
      >
        <Zap size={22} className="group-hover:rotate-12 transition-transform duration-200" />
      </button>

      {/* 输入模态层 */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
          {/* 背景遮罩 */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
            onClick={() => { setIsOpen(false); setText(''); }}
          />

          {/* 输入面板 */}
          <div
            ref={modalRef}
            className="relative bg-page-bg border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-slide-up overflow-hidden"
          >
            {/* 顶部提示 */}
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <span className="text-xs text-text-tertiary">
                将保存至 {getTodayDateStr()} 时间轴
              </span>
              <button
                onClick={() => { setIsOpen(false); setText(''); }}
                className="p-1 text-text-tertiary hover:text-text-secondary rounded-lg transition-colors"
                style={{ outline: 'none' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* 输入区域 */}
            <div className="p-5">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="记录你的灵感..."
                rows={4}
                className="w-full px-0 py-0 text-sm text-text-primary bg-transparent border-none resize-none placeholder:text-text-muted"
                style={{ minHeight: '100px', outline: 'none', boxShadow: 'none' }}
              />
            </div>

            {/* 底部按钮 */}
            <div className="px-5 py-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-text-muted">
                Enter 发送 · Shift+Enter 换行
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setIsOpen(false); setText(''); }}
                  className="px-4 py-1.5 text-sm text-text-secondary hover:bg-hover-bg rounded-lg transition-colors"
                  style={{ outline: 'none' }}
                >
                  取消
                </button>
                <button
                  onClick={handleSend}
                  disabled={!text.trim() || sending}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-sm text-white bg-accent hover:bg-accent-hover rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ outline: 'none' }}
                >
                  <Send size={14} />
                  {sending ? '发送中...' : '发送'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
