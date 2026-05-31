import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { documentDB } from '@/db/database';
import EmojiPicker from './EmojiPicker';

export default function TitleInput() {
  const { state, dispatch } = useApp();
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 当前文档
  const currentDoc = state.documents.find((doc) => doc.id === state.currentDocId);

  // 同步标题
  useEffect(() => {
    if (currentDoc) {
      setTitle(currentDoc.title === '未命名笔记' ? '' : currentDoc.title);
    }
  }, [currentDoc]);

  // 编辑时聚焦
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // 保存标题
  async function saveTitle() {
    if (!currentDoc) return;

    const newTitle = title.trim() || '未命名笔记';
    dispatch({
      type: 'UPDATE_DOCUMENT',
      payload: { id: currentDoc.id, updates: { title: newTitle } },
    });

    try {
      await documentDB.update(currentDoc.id, {
        title: newTitle,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('保存标题失败:', error);
    }

    setIsEditing(false);
  }

  // 保存图标
  async function saveIcon(icon: string) {
    if (!currentDoc) return;

    dispatch({
      type: 'UPDATE_DOCUMENT',
      payload: { id: currentDoc.id, updates: { icon } },
    });

    try {
      await documentDB.update(currentDoc.id, {
        icon,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('保存图标失败:', error);
    }
  }

  if (!currentDoc) {
    return null;
  }

  return (
    <div className="mb-3">
      {/* 图标选择 */}
      <div className="relative mb-3">
        <button
          onClick={() => setShowEmojiPicker(true)}
          className="group relative w-14 h-14 flex items-center justify-center text-3xl rounded-lg hover:bg-hover-bg transition-all duration-150"
          data-tooltip="设置图标"
        >
          {currentDoc.icon ? (
            <span>{currentDoc.icon}</span>
          ) : (
            <span className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              😀
            </span>
          )}
        </button>

        {/* Emoji 选择器 */}
        {showEmojiPicker && (
          <EmojiPicker
            value={currentDoc.icon}
            onChange={saveIcon}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}
      </div>

      {/* 标题输入 */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              saveTitle();
            }
            if (e.key === 'Escape') {
              setTitle(currentDoc.title === '未命名笔记' ? '' : currentDoc.title);
              setIsEditing(false);
            }
          }}
          placeholder="无标题"
          className="w-full text-display text-text-primary bg-transparent border-none placeholder-text-muted leading-tight focus:outline-none focus:ring-0 focus:shadow-none"
          style={{
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            outline: 'none',
            boxShadow: 'none',
          }}
        />
      ) : (
        <h1
          onClick={() => setIsEditing(true)}
          className="text-display text-text-primary leading-tight cursor-text hover:opacity-75 transition-opacity duration-150"
          style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
        >
          {currentDoc.title || '无标题'}
        </h1>
      )}
    </div>
  );
}
