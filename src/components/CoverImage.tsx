import { useState, useRef, useEffect } from 'react';
import { ImageIcon, X, Palette } from 'lucide-react';

interface CoverImageProps {
  value?: string;
  onChange: (cover: string) => void;
}

// 预设渐变色
const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
  'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)',
];

export default function CoverImage({ value, onChange }: CoverImageProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 判断是否为渐变色
  function isGradient(value: string): boolean {
    return value.startsWith('linear-gradient');
  }

  // 获取背景样式
  function getBgStyle(value: string): React.CSSProperties {
    if (isGradient(value)) {
      return { background: value };
    }
    return { backgroundImage: `url(${value})` };
  }

  return (
    <div className="relative">
      {/* 封面图显示 */}
      {value ? (
        <div
          className="relative w-full h-[200px] bg-cover bg-center group"
          style={getBgStyle(value)}
        >
          {/* 操作按钮 */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-page-bg/90 hover:bg-page-bg text-text-primary rounded-md shadow-sm backdrop-blur-sm transition-all duration-150"
            >
              <Palette size={14} />
              更换
            </button>
            <button
              onClick={() => onChange('')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-page-bg/90 hover:bg-page-bg text-red-500 rounded-md shadow-sm backdrop-blur-sm transition-all duration-150"
            >
              <X size={14} />
              移除
            </button>
          </div>
        </div>
      ) : (
        /* 添加封面按钮 */
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-text-tertiary hover:text-text-secondary hover:bg-hover-bg rounded-lg transition-all duration-150 mb-4"
        >
          <ImageIcon size={16} />
          添加封面
        </button>
      )}

      {/* 选择器弹窗 */}
      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute left-0 top-full z-50 bg-page-bg border border-border rounded-xl shadow-lg p-4 w-[360px] animate-slide-up"
        >
          {/* URL 输入 */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              图片 URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-1.5 text-sm bg-hover-bg border-none rounded-md outline-none placeholder-text-tertiary text-text-primary focus:ring-1 focus:ring-accent"
              />
              <button
                onClick={() => {
                  if (urlInput.trim()) {
                    onChange(urlInput.trim());
                    setUrlInput('');
                    setShowPicker(false);
                  }
                }}
                className="px-3 py-1.5 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-hover transition-colors duration-150"
              >
                应用
              </button>
            </div>
          </div>

          {/* 渐变色选择 */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              渐变色
            </label>
            <div className="grid grid-cols-6 gap-2">
              {GRADIENTS.map((gradient, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onChange(gradient);
                    setShowPicker(false);
                  }}
                  className={`w-full aspect-video rounded-md transition-all duration-150 hover:scale-105 ${
                    value === gradient ? 'ring-2 ring-accent ring-offset-2' : ''
                  }`}
                  style={{ background: gradient }}
                />
              ))}
            </div>
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={() => setShowPicker(false)}
            className="mt-3 w-full py-1.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors duration-150"
          >
            关闭
          </button>
        </div>
      )}
    </div>
  );
}
