import { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  FileText,
  File,
  BookOpen,
  ClipboardList,
  CheckSquare,
  BookMarked,
  BarChart2,
  Rocket,
  Code,
  Calendar,
  Clock,
  Lightbulb,
  Target,
  Palette,
  Music,
  Camera,
  Link,
  Settings,
  Bookmark,
  Folder,
  type LucideIcon,
} from 'lucide-react';
import { getTemplates, saveCustomTemplate, deleteCustomTemplate } from '@/data/templates';
import type { Template } from '@/types';

// 图标映射
const iconMap: Record<string, LucideIcon> = {
  'file-text': FileText,
  'file': File,
  'book-open': BookOpen,
  'clipboard-list': ClipboardList,
  'check-square': CheckSquare,
  'book-marked': BookMarked,
  'bar-chart-2': BarChart2,
  'rocket': Rocket,
  'code': Code,
  'calendar': Calendar,
  'clock': Clock,
  'lightbulb': Lightbulb,
  'target': Target,
  'palette': Palette,
  'music': Music,
  'camera': Camera,
  'link': Link,
  'settings': Settings,
  'bookmark': Bookmark,
  'folder': Folder,
};

// 可选图标列表
const iconOptions = [
  'file-text', 'file', 'book-open', 'clipboard-list', 'check-square',
  'book-marked', 'bar-chart-2', 'rocket', 'code', 'calendar',
  'clock', 'lightbulb', 'target', 'palette', 'music',
  'camera', 'link', 'settings', 'bookmark', 'folder',
];

// 渲染图标
function TemplateIcon({ name, size = 24 }: { name: string; size?: number }) {
  const IconComponent = iconMap[name] || FileText;
  return <IconComponent size={size} />;
}

interface TemplatePickerProps {
  onSelect: (template: Template) => void;
  onClose: () => void;
  currentContent?: string;
}

export default function TemplatePicker({ onSelect, onClose, currentContent }: TemplatePickerProps) {
  const [templates, setTemplates] = useState<Template[]>(getTemplates());
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateIcon, setNewTemplateIcon] = useState('file-text');
  const [activeTab, setActiveTab] = useState<'builtin' | 'custom'>('builtin');

  const builtinTemplates = templates.filter(t => t.category === 'builtin');
  const customTemplates = templates.filter(t => t.category === 'custom');

  // 保存当前内容为模板
  const handleSaveTemplate = () => {
    if (!newTemplateName.trim() || !currentContent) return;

    saveCustomTemplate({
      name: newTemplateName.trim(),
      icon: newTemplateIcon,
      description: '自定义模板',
      content: currentContent,
    });

    setTemplates(getTemplates());
    setShowSaveDialog(false);
    setNewTemplateName('');
  };

  // 删除自定义模板
  const handleDeleteTemplate = (id: string) => {
    deleteCustomTemplate(id);
    setTemplates(getTemplates());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-page-bg border border-border rounded-2xl shadow-2xl w-full max-w-[600px] mx-4 animate-slide-up overflow-hidden max-h-[80vh] flex flex-col">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-accent" />
            <h2 className="text-lg font-semibold text-text-primary">笔记模板</h2>
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
            onClick={() => setActiveTab('builtin')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors duration-150 ${
              activeTab === 'builtin'
                ? 'text-accent border-accent'
                : 'text-text-muted border-transparent hover:text-text-secondary'
            }`}
          >
            内置模板
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors duration-150 ${
              activeTab === 'custom'
                ? 'text-accent border-accent'
                : 'text-text-muted border-transparent hover:text-text-secondary'
            }`}
          >
            我的模板 {customTemplates.length > 0 && `(${customTemplates.length})`}
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'builtin' ? (
            <div className="grid grid-cols-2 gap-3">
              {builtinTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => onSelect(template)}
                  className="flex items-start gap-3 p-4 rounded-xl border border-border hover:border-accent hover:bg-accent-light transition-all duration-150 text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center flex-shrink-0">
                    <TemplateIcon name={template.icon} size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary group-hover:text-accent">
                      {template.name}
                    </div>
                    <div className="text-xs text-text-muted mt-1 line-clamp-2">
                      {template.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div>
              {/* 保存为模板按钮 */}
              {currentContent && (
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="w-full flex items-center justify-center gap-2 p-4 mb-4 rounded-xl border-2 border-dashed border-border hover:border-accent hover:bg-accent-light transition-all duration-150 text-sm text-text-muted hover:text-accent"
                >
                  <Plus size={16} />
                  将当前文档保存为模板
                </button>
              )}

              {/* 自定义模板列表 */}
              {customTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--hover-bg)' }}>
                    <FileText size={24} className="text-text-muted" />
                  </div>
                  <p className="text-sm text-text-tertiary mb-1">暂无自定义模板</p>
                  <p className="text-xs text-text-muted">创建文档后可以保存为模板</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {customTemplates.map(template => (
                    <div
                      key={template.id}
                      className="flex items-start gap-3 p-4 rounded-xl border border-border hover:border-accent hover:bg-accent-light transition-all duration-150 group"
                    >
                      <button
                        onClick={() => onSelect(template)}
                        className="flex items-start gap-3 flex-1 text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center flex-shrink-0">
                          <TemplateIcon name={template.icon} size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-text-primary group-hover:text-accent">
                            {template.name}
                          </div>
                          <div className="text-xs text-text-muted mt-1">
                            {template.description}
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.id);
                        }}
                        className="p-1.5 text-text-muted hover:text-red-500 rounded-md transition-colors duration-150 opacity-0 group-hover:opacity-100"
                        title="删除模板"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 保存模板对话框 */}
        {showSaveDialog && (
          <div className="absolute inset-0 bg-page-bg flex flex-col">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">保存为模板</h3>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="p-1.5 text-text-muted hover:text-text-secondary rounded-lg transition-colors duration-150"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 p-6 space-y-6">
              {/* 图标选择 */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  选择图标
                </label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map(iconName => (
                    <button
                      key={iconName}
                      onClick={() => setNewTemplateIcon(iconName)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 ${
                        newTemplateIcon === iconName
                          ? 'bg-accent-light ring-2 ring-accent text-accent'
                          : 'text-text-muted hover:bg-hover-bg hover:text-text-secondary'
                      }`}
                    >
                      <TemplateIcon name={iconName} size={18} />
                    </button>
                  ))}
                </div>
              </div>

              {/* 名称输入 */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  模板名称
                </label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="输入模板名称..."
                  className="w-full px-4 py-2.5 text-sm border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent-ring transition-all duration-150"
                  style={{ backgroundColor: 'var(--hover-bg)' }}
                  autoFocus
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 py-2.5 text-sm font-medium text-text-secondary bg-hover-bg hover:bg-active-bg rounded-lg transition-colors duration-150"
              >
                取消
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={!newTemplateName.trim()}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
