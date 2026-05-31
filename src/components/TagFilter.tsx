import { useMemo } from 'react';
import { Tag, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export default function TagFilter() {
  const { state, dispatch } = useApp();

  // 计算所有标签及其数量
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    state.documents.forEach((doc) => {
      doc.tags?.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });

    // 按数量排序
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20); // 最多显示 20 个标签
  }, [state.documents]);

  // 如果没有标签，不显示
  if (tagCounts.length === 0) {
    return null;
  }

  return (
    <div className="px-3 py-2 border-t border-border">
      {/* 标题 */}
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-1.5">
          <Tag size={12} className="text-text-tertiary" />
          <span className="text-xs font-medium text-text-tertiary">标签</span>
        </div>
        {state.filterTag && (
          <button
            onClick={() => dispatch({ type: 'SET_FILTER_TAG', payload: null })}
            className="text-xs text-text-tertiary hover:text-text-secondary transition-colors duration-150"
          >
            清除筛选
          </button>
        )}
      </div>

      {/* 标签云 */}
      <div className="flex flex-wrap gap-1.5">
        {tagCounts.map(([tag, count]) => {
          const isActive = state.filterTag === tag;

          return (
            <button
              key={tag}
              onClick={() => {
                dispatch({
                  type: 'SET_FILTER_TAG',
                  payload: isActive ? null : tag,
                });
              }}
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-all duration-150 ${
                isActive
                  ? 'bg-accent text-white'
                  : 'bg-hover-bg text-text-secondary hover:text-text-primary hover:bg-active-bg'
              }`}
            >
              {tag}
              <span className={`text-[10px] ${isActive ? 'text-white/70' : 'text-text-tertiary'}`}>
                {count}
              </span>
              {isActive && (
                <X size={10} className="ml-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
