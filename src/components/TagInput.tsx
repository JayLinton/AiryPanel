import { useState, useRef, useEffect } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { documentDB } from '@/db/database';

interface TagInputProps {
  docId: string;
  tags: string[];
}

export default function TagInput({ docId, tags }: TagInputProps) {
  const { dispatch } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 输入时聚焦
  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  // 添加标签
  async function addTags(tagText: string) {
    const newTags = tagText
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter((t) => t && !tags.includes(t));

    if (newTags.length === 0) return;

    const updatedTags = [...tags, ...newTags];

    dispatch({
      type: 'UPDATE_DOCUMENT',
      payload: { id: docId, updates: { tags: updatedTags } },
    });

    await documentDB.update(docId, {
      tags: updatedTags,
      updatedAt: Date.now(),
    });
  }

  // 删除标签
  async function removeTag(tagToRemove: string) {
    const updatedTags = tags.filter((t) => t !== tagToRemove);

    dispatch({
      type: 'UPDATE_DOCUMENT',
      payload: { id: docId, updates: { tags: updatedTags } },
    });

    await documentDB.update(docId, {
      tags: updatedTags,
      updatedAt: Date.now(),
    });
  }

  // 处理键盘事件
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTags(inputValue);
        setInputValue('');
      }
    } else if (e.key === 'Escape') {
      setInputValue('');
      setIsAdding(false);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // 删除最后一个标签
      removeTag(tags[tags.length - 1]);
    }
  }

  // 处理失焦
  function handleBlur() {
    if (inputValue.trim()) {
      addTags(inputValue);
      setInputValue('');
    }
    setIsAdding(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-4">
      {/* 标签图标 */}
      <Tag size={14} className="text-text-tertiary" />

      {/* 现有标签 */}
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-hover-bg text-text-primary rounded-md group"
        >
          {tag}
          <button
            onClick={() => removeTag(tag)}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-500 transition-all duration-150"
          >
            <X size={10} />
          </button>
        </span>
      ))}

      {/* 添加标签 */}
      {isAdding ? (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="输入标签，回车确认"
          className="px-2 py-0.5 text-xs bg-transparent border-none outline-none placeholder-text-tertiary text-text-primary w-32"
        />
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs text-text-tertiary hover:text-text-secondary hover:bg-hover-bg rounded-md transition-colors duration-150"
        >
          <Plus size={12} />
          添加标签
        </button>
      )}
    </div>
  );
}
