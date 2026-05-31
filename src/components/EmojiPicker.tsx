import { useState, useRef, useEffect } from 'react';

interface EmojiPickerProps {
  value?: string;
  onChange: (emoji: string) => void;
  onClose: () => void;
}

// 常用 emoji 分类
const EMOJI_CATEGORIES = [
  {
    name: '常用',
    emojis: ['📝', '📄', '📋', '📌', '📎', '📒', '📓', '📕', '📗', '📘', '📙', '📚'],
  },
  {
    name: '表情',
    emojis: ['😊', '😂', '🤣', '❤️', '👍', '🎉', '🔥', '✨', '💯', '⭐', '🌟', '💪'],
  },
  {
    name: '工作',
    emojis: ['💼', '📊', '📈', '📉', '🎯', '📌', '🗂️', '📁', '📂', '🗃️', '⏰', '📅'],
  },
  {
    name: '学习',
    emojis: ['📖', '✏️', '🖊️', '📐', '🔬', '🧪', '🎓', '💡', '🧠', '📝', '✍️', '📚'],
  },
  {
    name: '生活',
    emojis: ['🏠', '☕', '🍵', '🍕', '🍔', '🎵', '🎬', '📸', '🎨', '🏋️', '🧘', '🌿'],
  },
  {
    name: '符号',
    emojis: ['✅', '❌', '⚠️', '❗', '❓', '💯', '🔴', '🟡', '🟢', '🔵', '⚪', '⬛'],
  },
];

export default function EmojiPicker({ value, onChange, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const pickerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className="absolute left-0 top-full z-50 bg-page-bg border border-border rounded-xl shadow-lg p-3 w-[320px] animate-slide-up"
    >
      {/* 分类标签 */}
      <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
        {EMOJI_CATEGORIES.map((category, index) => (
          <button
            key={category.name}
            onClick={() => setActiveCategory(index)}
            className={`px-2 py-1 text-xs rounded-md whitespace-nowrap transition-colors duration-150 ${
              activeCategory === index
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:bg-hover-bg'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Emoji 网格 */}
      <div className="grid grid-cols-8 gap-1">
        {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onChange(emoji);
              onClose();
            }}
            className={`w-9 h-9 flex items-center justify-center text-xl rounded-lg transition-colors duration-150 ${
              value === emoji
                ? 'bg-accent/10 ring-1 ring-accent'
                : 'hover:bg-hover-bg'
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* 当前选中 */}
      {value && (
        <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
          <span className="text-xs text-text-tertiary">当前图标</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{value}</span>
            <button
              onClick={() => {
                onChange('');
                onClose();
              }}
              className="text-xs text-text-tertiary hover:text-red-500 transition-colors duration-150"
            >
              移除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
