import { useState, useMemo } from 'react';
import { X, FileText, Tag, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import type { Document } from '@/types';

interface StatsPanelProps {
  documents: Document[];
  onClose: () => void;
}

export default function StatsPanel({ documents, onClose }: StatsPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tags' | 'activity' | 'contribution'>('overview');

  // 过滤未删除的文档
  const activeDocs = useMemo(() => documents.filter(doc => !doc.deletedAt), [documents]);

  // 统计数据
  const stats = useMemo(() => {
    // 总文档数
    const totalDocs = activeDocs.length;

    // 总字数
    let totalWords = 0;
    let totalChars = 0;
    activeDocs.forEach(doc => {
      if (doc.content) {
        try {
          const content = JSON.parse(doc.content);
          const text = extractText(content);
          totalWords += text.split(/\s+/).filter(w => w.length > 0).length;
          totalChars += text.length;
        } catch {
          // 忽略解析错误
        }
      }
    });

    // 标签统计
    const tagCounts: Record<string, number> = {};
    activeDocs.forEach(doc => {
      doc.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const sortedTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    // 收藏数
    const favoriteCount = activeDocs.filter(doc => doc.isFavorite).length;

    // 最近7天创建的文档
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const recentDocs = activeDocs.filter(doc => doc.createdAt > sevenDaysAgo).length;

    // 每日创建统计（最近7天）
    const dailyCreated: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const count = activeDocs.filter(doc => doc.createdAt >= dayStart && doc.createdAt < dayEnd).length;
      dailyCreated.push({
        date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        count,
      });
    }

    // 每日更新统计（最近7天）
    const dailyUpdated: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const count = activeDocs.filter(doc => doc.updatedAt >= dayStart && doc.updatedAt < dayEnd).length;
      dailyUpdated.push({
        date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        count,
      });
    }

    // 创作日历数据（最近 26 周）
    const contributionData: { date: string; count: number; level: number }[] = [];
    for (let i = 181; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const count = activeDocs.filter(doc =>
        doc.createdAt >= dayStart && doc.createdAt < dayEnd ||
        doc.updatedAt >= dayStart && doc.updatedAt < dayEnd
      ).length;

      // 计算贡献等级 (0-4)
      let level = 0;
      if (count >= 4) level = 4;
      else if (count >= 3) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;

      contributionData.push({
        date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        count,
        level,
      });
    }

    // 计算总贡献数
    const totalContributions = contributionData.reduce((sum, day) => sum + day.count, 0);

    // 计算连续天数
    let currentStreak = 0;
    for (let i = contributionData.length - 1; i >= 0; i--) {
      if (contributionData[i].count > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      totalDocs,
      totalWords,
      totalChars,
      favoriteCount,
      recentDocs,
      sortedTags,
      dailyCreated,
      dailyUpdated,
      contributionData,
      totalContributions,
      currentStreak,
    };
  }, [activeDocs]);

  // 提取文本
  function extractText(node: Record<string, unknown>): string {
    if (node.type === 'text') {
      return (node.text as string) || '';
    }
    if (Array.isArray(node.content)) {
      return node.content.map((child: Record<string, unknown>) => extractText(child)).join('');
    }
    return '';
  }

  // 计算柱状图最大值
  const maxDailyCount = useMemo(() => {
    const maxCreated = Math.max(...stats.dailyCreated.map(d => d.count));
    const maxUpdated = Math.max(...stats.dailyUpdated.map(d => d.count));
    return Math.max(maxCreated, maxUpdated, 1);
  }, [stats]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-page-bg border border-border rounded-2xl shadow-2xl w-full max-w-[700px] mx-4 animate-slide-up overflow-hidden max-h-[85vh] flex flex-col">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 size={20} className="text-accent" />
            <h2 className="text-lg font-semibold text-text-primary">数据统计</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-secondary rounded-lg transition-colors duration-150"
          >
            <X size={18} />
          </button>
        </div>

        {/* 标签页 */}
        <div className="px-6 pt-4 flex gap-4 border-b border-border">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors duration-150 ${
              activeTab === 'overview'
                ? 'text-accent border-accent'
                : 'text-text-muted border-transparent hover:text-text-secondary'
            }`}
          >
            概览
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors duration-150 ${
              activeTab === 'tags'
                ? 'text-accent border-accent'
                : 'text-text-muted border-transparent hover:text-text-secondary'
            }`}
          >
            标签分析
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors duration-150 ${
              activeTab === 'activity'
                ? 'text-accent border-accent'
                : 'text-text-muted border-transparent hover:text-text-secondary'
            }`}
          >
            活动趋势
          </button>
          <button
            onClick={() => setActiveTab('contribution')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors duration-150 ${
              activeTab === 'contribution'
                ? 'text-accent border-accent'
                : 'text-text-muted border-transparent hover:text-text-secondary'
            }`}
          >
            创作日历
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 统计卡片 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-hover-bg">
                  <div className="flex items-center gap-2 text-text-muted mb-2">
                    <FileText size={16} />
                    <span className="text-xs">文档总数</span>
                  </div>
                  <div className="text-3xl font-bold text-text-primary">{stats.totalDocs}</div>
                  <div className="text-xs text-text-muted mt-1">最近7天新增 {stats.recentDocs} 篇</div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-hover-bg">
                  <div className="flex items-center gap-2 text-text-muted mb-2">
                    <TrendingUp size={16} />
                    <span className="text-xs">总字数</span>
                  </div>
                  <div className="text-3xl font-bold text-text-primary">{stats.totalChars.toLocaleString()}</div>
                  <div className="text-xs text-text-muted mt-1">约 {stats.totalWords.toLocaleString()} 词</div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-hover-bg">
                  <div className="flex items-center gap-2 text-text-muted mb-2">
                    <Tag size={16} />
                    <span className="text-xs">标签数量</span>
                  </div>
                  <div className="text-3xl font-bold text-text-primary">{stats.sortedTags.length}</div>
                  <div className="text-xs text-text-muted mt-1">共 {stats.sortedTags.reduce((sum, [, count]) => sum + count, 0)} 次使用</div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-hover-bg">
                  <div className="flex items-center gap-2 text-text-muted mb-2">
                    <Clock size={16} />
                    <span className="text-xs">收藏文档</span>
                  </div>
                  <div className="text-3xl font-bold text-text-primary">{stats.favoriteCount}</div>
                  <div className="text-xs text-text-muted mt-1">占总文档 {stats.totalDocs > 0 ? Math.round(stats.favoriteCount / stats.totalDocs * 100) : 0}%</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="space-y-4">
              {stats.sortedTags.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--hover-bg)' }}>
                    <Tag size={24} className="text-text-muted" />
                  </div>
                  <p className="text-sm text-text-tertiary mb-1">暂无标签</p>
                  <p className="text-xs text-text-muted">为文档添加标签后可查看统计</p>
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-medium text-text-secondary">热门标签 TOP 10</h3>
                  <div className="space-y-3">
                    {stats.sortedTags.map(([tag, count]) => (
                      <div key={tag} className="flex items-center gap-3">
                        <span className="text-sm text-text-primary w-24 truncate">{tag}</span>
                        <div className="flex-1 h-6 bg-hover-bg rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all duration-500"
                            style={{ width: `${(count / stats.sortedTags[0][1]) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-text-muted w-12 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              {/* 每日创建 */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-4">最近7天新建文档</h3>
                <div className="flex items-end gap-2 h-32">
                  {stats.dailyCreated.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end justify-center" style={{ height: '100px' }}>
                        <div
                          className="w-full max-w-[40px] bg-accent rounded-t-md transition-all duration-500"
                          style={{ height: `${(day.count / maxDailyCount) * 100}%`, minHeight: day.count > 0 ? '8px' : '0' }}
                        />
                      </div>
                      <span className="text-[10px] text-text-muted">{day.date}</span>
                      <span className="text-xs font-medium text-text-secondary">{day.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 每日更新 */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-4">最近7天更新文档</h3>
                <div className="flex items-end gap-2 h-32">
                  {stats.dailyUpdated.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end justify-center" style={{ height: '100px' }}>
                        <div
                          className="w-full max-w-[40px] bg-accent-light rounded-t-md transition-all duration-500"
                          style={{ height: `${(day.count / maxDailyCount) * 100}%`, minHeight: day.count > 0 ? '8px' : '0' }}
                        />
                      </div>
                      <span className="text-[10px] text-text-muted">{day.date}</span>
                      <span className="text-xs font-medium text-text-secondary">{day.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contribution' && (
            <div className="space-y-6">
              {/* 贡献统计 */}
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-3xl font-bold text-text-primary">{stats.totalContributions}</div>
                  <div className="text-xs text-text-muted">过去一年的贡献</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-text-primary">{stats.currentStreak}</div>
                  <div className="text-xs text-text-muted">连续活跃天数</div>
                </div>
              </div>

              {/* 创作日历 */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-4">
                  最近 6 个月的写作活动
                </h3>
                <div className="overflow-x-auto pb-2">
                  <div className="inline-flex flex-col gap-[3px] w-full">
                    {/* 星期标签 */}
                    <div className="flex gap-[3px] text-[10px] text-text-muted">
                      <div className="w-[18px]" />
                      {['一', '三', '五', '日'].map((day, i) => (
                        <div key={day} className="w-[18px] h-[18px] flex items-center justify-center" style={{ marginLeft: i === 0 ? 0 : 36 }}>
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* 创作方块 */}
                    {Array.from({ length: 7 }, (_, weekDay) => (
                      <div key={weekDay} className="flex gap-[3px]">
                        {/* 星期标签 */}
                        <div className="w-[18px] h-[18px] flex items-center justify-center text-[10px] text-text-muted">
                          {weekDay === 0 ? '一' : weekDay === 2 ? '三' : weekDay === 4 ? '五' : weekDay === 6 ? '日' : ''}
                        </div>

                        {/* 方块 */}
                        {Array.from({ length: 26 }, (_, week) => {
                          const index = week * 7 + weekDay;
                          const day = stats.contributionData[index];
                          if (!day) return <div key={week} className="w-[18px] h-[18px]" />;

                          const bgColor = [
                            'bg-hover-bg',
                            'bg-accent/20',
                            'bg-accent/40',
                            'bg-accent/60',
                            'bg-accent',
                          ][day.level];

                          return (
                            <div
                              key={week}
                              className={`w-[18px] h-[18px] rounded-sm ${bgColor} transition-colors duration-150 cursor-pointer hover:ring-1 hover:ring-accent-ring group relative`}
                              title={`${day.date}: ${day.count} 次活动`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 图例 */}
                <div className="flex items-center gap-2 mt-4 text-xs text-text-muted">
                  <span>少</span>
                  <div className="flex gap-1">
                    <div className="w-[18px] h-[18px] rounded-sm bg-hover-bg" />
                    <div className="w-[18px] h-[18px] rounded-sm bg-accent/20" />
                    <div className="w-[18px] h-[18px] rounded-sm bg-accent/40" />
                    <div className="w-[18px] h-[18px] rounded-sm bg-accent/60" />
                    <div className="w-[18px] h-[18px] rounded-sm bg-accent" />
                  </div>
                  <span>多</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-text-secondary bg-hover-bg hover:bg-active-bg rounded-lg transition-colors duration-150"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
