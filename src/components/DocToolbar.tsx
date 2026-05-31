import { useState, useRef, useEffect } from 'react';
import { Download, Upload, ChevronDown, FileText, Code } from 'lucide-react';
import TurndownService from 'turndown';
import { marked } from 'marked';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '@/contexts/AppContext';
import { documentDB } from '@/db/database';
import type { Editor } from '@tiptap/react';

interface DocToolbarProps {
  editor: Editor | null;
}

export default function DocToolbar({ editor }: DocToolbarProps) {
  const { state, dispatch } = useApp();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 当前文档
  const currentDoc = state.documents.find((doc) => doc.id === state.currentDocId);

  // 点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 导出为 Markdown（带 frontmatter）
  function handleExportMarkdown() {
    if (!currentDoc || !editor) return;

    const html = editor.getHTML();

    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });

    const markdown = turndownService.turndown(html);

    // 生成 frontmatter
    const frontmatter = [
      '---',
      `title: "${currentDoc.title}"`,
      `created: ${new Date(currentDoc.createdAt).toISOString()}`,
      `updated: ${new Date(currentDoc.updatedAt).toISOString()}`,
      currentDoc.tags?.length ? `tags: [${currentDoc.tags.map((t) => `"${t}"`).join(', ')}]` : null,
      '---',
      '',
    ]
      .filter(Boolean)
      .join('\n');

    const fullMarkdown = frontmatter + markdown;

    const blob = new Blob([fullMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDoc.title || '未命名笔记'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }

  // 导出为 HTML
  function handleExportHTML() {
    if (!currentDoc || !editor) return;

    const html = editor.getHTML();

    const fullHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentDoc.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
      max-width: 720px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #374151;
      line-height: 1.6;
    }
    h1 { font-size: 2em; font-weight: 700; margin-bottom: 0.5em; }
    h2 { font-size: 1.5em; font-weight: 600; margin-top: 1.5em; margin-bottom: 0.5em; }
    h3 { font-size: 1.25em; font-weight: 600; margin-top: 1.2em; margin-bottom: 0.5em; }
    p { margin-bottom: 0.5em; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
    pre { background: #f3f4f6; padding: 16px; border-radius: 6px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 3px solid #2eaadc; padding-left: 16px; margin: 16px 0; color: #6b7280; }
    ul, ol { padding-left: 24px; margin: 8px 0; }
    li { margin-bottom: 4px; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 32px 0; }
    img { max-width: 100%; border-radius: 4px; }
    a { color: #2eaadc; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
    th { background: #f9fafb; font-weight: 600; }
  </style>
</head>
<body>
  <h1>${currentDoc.title}</h1>
  ${html}
</body>
</html>`;

    const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDoc.title || '未命名笔记'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }

  // 导入 Markdown
  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const html = await marked.parse(text);

      let title = '未命名笔记';
      const lines = text.split('\n');
      const firstLine = lines[0]?.trim();
      if (firstLine?.startsWith('# ')) {
        title = firstLine.replace(/^#\s+/, '');
      } else {
        title = file.name.replace(/\.md$/i, '') || '未命名笔记';
      }

      const now = Date.now();
      const newDoc = {
        id: uuidv4(),
        title,
        content: '',
        createdAt: now,
        updatedAt: now,
      };

      await documentDB.create(newDoc);
      dispatch({ type: 'ADD_DOCUMENT', payload: newDoc });
      dispatch({ type: 'SET_CURRENT_DOC', payload: newDoc.id });

      const checkEditor = setInterval(() => {
        if (editor && !editor.isDestroyed) {
          clearInterval(checkEditor);
          const contentHtml = html.replace(/<h1[^>]*>.*?<\/h1>/i, '').trim();
          editor.commands.setContent(contentHtml);

          const json = editor.getJSON();
          documentDB.update(newDoc.id, {
            content: JSON.stringify(json),
            updatedAt: Date.now(),
          });
        }
      }, 50);

      setTimeout(() => clearInterval(checkEditor), 5000);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('导入失败:', error);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* 导出下拉菜单 */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          disabled={!currentDoc}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-text-tertiary hover:text-text-secondary hover:bg-hover-bg rounded-md transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <Download size={14} />
          <span>导出</span>
          <ChevronDown size={12} />
        </button>

        {showExportMenu && (
          <div className="absolute right-0 top-full mt-1 z-50 bg-page-bg border border-border rounded-lg shadow-lg py-1.5 min-w-[160px] animate-fade-in">
            <button
              onClick={handleExportMarkdown}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:bg-hover-bg transition-colors duration-150"
            >
              <FileText size={15} />
              导出 Markdown
            </button>
            <button
              onClick={handleExportHTML}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:bg-hover-bg transition-colors duration-150"
            >
              <Code size={15} />
              导出 HTML
            </button>
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-border" />

      {/* 导入按钮 */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-text-tertiary hover:text-text-secondary hover:bg-hover-bg rounded-md transition-all duration-150 whitespace-nowrap"
        title="导入 Markdown"
      >
        <Upload size={14} />
        <span>导入</span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,.txt"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
}
