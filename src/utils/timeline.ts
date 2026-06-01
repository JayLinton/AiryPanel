// 时间轴工具函数

// 获取今日日期字符串 "2026-06-01"
export function getTodayDateStr(date?: Date): string {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 获取每日时间轴笔记标题
export function getDailyTitle(dateStr?: string): string {
  return `DailyStream:${dateStr || getTodayDateStr()}`;
}

// 从标题中提取日期
export function extractDateFromTitle(title: string): string | null {
  const match = title.match(/^DailyStream:(\d{4}-\d{2}-\d{2})$/);
  return match ? match[1] : null;
}

// 判断是否是时间轴笔记
export function isTimelineNote(title: string): boolean {
  return title.startsWith('DailyStream:');
}

// 时间轴条目
export interface TimelineEntry {
  time: string;    // "13:14"
  content: string; // 原始 Markdown 内容
}

// 解析时间轴 Markdown 为条目数组
export function parseTimelineEntries(markdown: string): TimelineEntry[] {
  if (!markdown || !markdown.trim()) return [];

  // 移除标题行 (# 2026-06-01)
  const lines = markdown.split('\n');
  const contentLines: string[] = [];
  let started = false;

  for (const line of lines) {
    if (line.startsWith('# ')) {
      started = true;
      continue;
    }
    if (started || !line.startsWith('# ')) {
      started = true;
      contentLines.push(line);
    }
  }

  const content = contentLines.join('\n').trim();
  if (!content) return [];

  // 按 --- 分割条目
  const blocks = content.split(/\n---\n|\n---$|^---\n/).filter(b => b.trim());

  const entries: TimelineEntry[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // 匹配 **HH:MM** 格式
    const timeMatch = trimmed.match(/^\*\*(\d{1,2}:\d{2})\*\*\s*/);
    if (timeMatch) {
      entries.push({
        time: timeMatch[1],
        content: trimmed.slice(timeMatch[0].length).trim(),
      });
    } else {
      // 没有时间戳的条目，尝试从其他格式解析
      entries.push({
        time: '',
        content: trimmed,
      });
    }
  }

  return entries;
}

// 生成时间轴条目 Markdown
export function formatEntry(text: string, date?: Date): string {
  const now = date || new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const time = `${hours}:${minutes}`;

  return `\n---\n\n**${time}** ${text}\n`;
}

// 生成完整的时间轴文件 Markdown
export function generateTimelineMarkdown(dateStr: string, entries: TimelineEntry[]): string {
  const lines = [`# ${dateStr}`, ''];

  for (const entry of entries) {
    lines.push('---');
    lines.push('');
    if (entry.time) {
      lines.push(`**${entry.time}** ${entry.content}`);
    } else {
      lines.push(entry.content);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// 追加条目到现有 Markdown
export function appendToMarkdown(existing: string, text: string, date?: Date): string {
  const now = date || new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const time = `${hours}:${minutes}`;

  const entry = `\n---\n\n**${time}** ${text}\n`;

  // 如果文件为空或只有标题
  if (!existing || existing.trim() === `# ${getTodayDateStr(date)}` || existing.trim() === `# ${getTodayDateStr(date)}\n`) {
    return `# ${getTodayDateStr(date)}\n${entry}`;
  }

  return existing + entry;
}

// 格式化时间显示
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// 格式化日期显示
export function formatDateDisplay(dateStr: string): string {
  const today = getTodayDateStr();
  const yesterday = getTodayDateStr(new Date(Date.now() - 86400000));

  if (dateStr === today) return '今天';
  if (dateStr === yesterday) return '昨天';

  const parts = dateStr.split('-');
  return `${parts[1]}月${parseInt(parts[2])}日`;
}
