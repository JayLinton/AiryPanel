import { useState, useEffect, useMemo } from 'react';
import { Clock, Sparkles, X } from 'lucide-react';
import { notesAPI, type NoteData } from '../api/client';
import {
  getTodayDateStr,
  isTimelineNote,
  extractDateFromTitle,
  parseTimelineEntries,
  formatDateDisplay,
} from '../utils/timeline';

export function TimelineView({ onBack }: { onBack?: () => void }) {
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayDateStr());

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    try {
      const data = await notesAPI.getAll();
      setNotes(data.filter(n => !n.deletedAt));
    } catch (error) {
      console.error('加载笔记失败:', error);
    } finally {
      setLoading(false);
    }
  }

  const timelineNotes = useMemo(() => {
    return notes
      .filter(n => isTimelineNote(n.title))
      .sort((a, b) => b.title.localeCompare(a.title));
  }, [notes]);

  const dateList = useMemo(() => {
    return timelineNotes
      .map(n => extractDateFromTitle(n.title))
      .filter(Boolean) as string[];
  }, [timelineNotes]);

  const currentNote = useMemo(() => {
    return timelineNotes.find(n => n.title === `DailyStream:${selectedDate}`);
  }, [timelineNotes, selectedDate]);

  const entries = useMemo(() => {
    if (!currentNote) return [];
    return parseTimelineEntries(currentNote.content);
  }, [currentNote]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* 左侧：时间轴内容 - 与编辑区同宽 */}
      <div className="relative flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--editor-bg)' }}>
        {/* 右上角磨砂圆形关闭按钮 */}
        <button
          onClick={() => onBack?.()}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-page-bg/80 backdrop-blur-sm border border-border/50 shadow-sm flex items-center justify-center text-text-tertiary hover:text-text-secondary transition-colors"
          title="关闭灵感"
        >
          <X size={14} />
        </button>

        {!currentNote || entries.length === 0 ? (
          /* 空状态 */
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center mb-4">
              <Sparkles size={24} className="text-accent" />
            </div>
            <h3 className="text-base font-semibold text-text-primary mb-2">
              {selectedDate === getTodayDateStr()
                ? '今天还没有捕获灵感'
                : `${formatDateDisplay(selectedDate)}没有记录`}
            </h3>
            <p className="text-sm text-text-tertiary max-w-[240px]">
              {selectedDate === getTodayDateStr()
                ? '点击右下角闪电按钮，记录灵感碎片'
                : '选择右侧日期查看灵感记录'}
            </p>
          </div>
        ) : (
          /* 时间轴 */
          <div className="max-w-[800px] mx-auto px-12 py-10">
            {/* 日期标题 */}
            <div className="flex items-center gap-3 mb-8 pb-5 border-b border-border">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-text-primary">{selectedDate}</h2>
                <p className="text-xs text-text-tertiary">{entries.length} 条灵感记录</p>
              </div>
            </div>

            {/* 时间轴条目 */}
            <div className="relative pl-8">
              {/* 竖线 */}
              <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-accent/30 via-accent/15 to-transparent" />

              {entries.map((entry, index) => (
                <div key={index} className="relative mb-5 last:mb-0 group">
                  {/* 圆点 */}
                  <div className="absolute -left-8 top-2.5 w-3 h-3 rounded-full bg-page-bg border-2 border-accent z-10 group-hover:scale-110 transition-transform">
                    <div className="absolute inset-[3px] rounded-full bg-accent" />
                  </div>

                  {/* 内容卡片 */}
                  <div className="bg-page-bg border border-border rounded-lg p-4 hover:border-accent/20 transition-all duration-200">
                    {entry.time && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <Clock size={11} className="text-accent" />
                        <span className="text-xs font-medium text-accent">{entry.time}</span>
                      </div>
                    )}
                    <div className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                      {entry.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 右侧：日期列表 - 与大纲栏同宽 */}
      <div className="w-56 shrink-0 border-l border-border flex flex-col" style={{ backgroundColor: 'var(--editor-bg)' }}>
        {/* 头部 */}
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />
          <span className="text-xs font-semibold text-text-primary">灵感</span>
        </div>

        {/* 日期列表 */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {dateList.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="w-10 h-10 rounded-full bg-hover-bg flex items-center justify-center mx-auto mb-3">
                <Clock size={16} className="text-text-muted" />
              </div>
              <p className="text-xs text-text-muted">还没有记录</p>
            </div>
          ) : (
            dateList.map(dateStr => {
              const isSelected = selectedDate === dateStr;
              const note = timelineNotes.find(n => n.title === `DailyStream:${dateStr}`);
              const entryCount = note ? parseTimelineEntries(note.content).length : 0;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`w-full px-3 py-2 rounded-lg mb-0.5 flex items-center justify-between text-xs transition-all duration-150 ${
                    isSelected
                      ? 'bg-accent/10 text-accent'
                      : 'text-text-secondary hover:bg-hover-bg'
                  }`}
                >
                  <span className="font-medium">{formatDateDisplay(dateStr)}</span>
                  <span className={`${isSelected ? 'text-accent/70' : 'text-text-muted'}`}>
                    {entryCount}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
