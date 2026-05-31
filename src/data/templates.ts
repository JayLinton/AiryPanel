import type { Template } from '@/types';

// 图标名称类型（对应 Lucide 图标）
export type TemplateIconName = 'file-text' | 'book-open' | 'clipboard-list' | 'check-square' | 'book-marked' | 'bar-chart-2' | 'rocket' | 'code' | 'file' | 'calendar' | 'clock' | 'lightbulb' | 'target' | 'palette' | 'music' | 'camera' | 'link' | 'settings' | 'bookmark' | 'folder';

// 生成 TipTap JSON 内容的辅助函数
function createContent(blocks: Array<{ type: string; content?: string; level?: number; items?: string[] }>): string {
  const doc = {
    type: 'doc',
    content: blocks.map(block => {
      if (block.type === 'heading') {
        return {
          type: 'heading',
          attrs: { level: block.level || 1 },
          content: block.content ? [{ type: 'text', text: block.content }] : undefined,
        };
      }
      if (block.type === 'paragraph') {
        return {
          type: 'paragraph',
          content: block.content ? [{ type: 'text', text: block.content }] : undefined,
        };
      }
      if (block.type === 'bulletList') {
        return {
          type: 'bulletList',
          content: (block.items || []).map(item => ({
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: item }],
            }],
          })),
        };
      }
      if (block.type === 'taskList') {
        return {
          type: 'taskList',
          content: (block.items || []).map(item => ({
            type: 'taskItem',
            attrs: { checked: false },
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: item }],
            }],
          })),
        };
      }
      if (block.type === 'blockquote') {
        return {
          type: 'blockquote',
          content: [{
            type: 'paragraph',
            content: block.content ? [{ type: 'text', text: block.content }] : undefined,
          }],
        };
      }
      if (block.type === 'horizontalRule') {
        return { type: 'horizontalRule' };
      }
      return {
        type: 'paragraph',
        content: block.content ? [{ type: 'text', text: block.content }] : undefined,
      };
    }),
  };
  return JSON.stringify(doc);
}

// 预设模板
export const builtinTemplates: Template[] = [
  {
    id: 'blank',
    name: '空白文档',
    icon: 'file',
    description: '从零开始创作',
    content: createContent([{ type: 'paragraph' }]),
    category: 'builtin',
    createdAt: Date.now(),
  },
  {
    id: 'diary',
    name: '日记',
    icon: 'book-open',
    description: '记录每天的生活',
    content: createContent([
      { type: 'heading', content: '日记标题', level: 1 },
      { type: 'paragraph', content: '日期：' },
      { type: 'paragraph', content: '天气：' },
      { type: 'horizontalRule' },
      { type: 'heading', content: '今日感悟', level: 2 },
      { type: 'paragraph' },
      { type: 'heading', content: '明日计划', level: 2 },
      { type: 'bulletList', items: ['计划1', '计划2', '计划3'] },
    ]),
    category: 'builtin',
    createdAt: Date.now(),
  },
  {
    id: 'meeting',
    name: '会议记录',
    icon: 'clipboard-list',
    description: '记录会议要点和待办',
    content: createContent([
      { type: 'heading', content: '会议主题', level: 1 },
      { type: 'paragraph', content: '日期：' },
      { type: 'paragraph', content: '参会人：' },
      { type: 'horizontalRule' },
      { type: 'heading', content: '会议议程', level: 2 },
      { type: 'bulletList', items: ['议程1', '议程2', '议程3'] },
      { type: 'heading', content: '讨论要点', level: 2 },
      { type: 'paragraph' },
      { type: 'heading', content: '决议事项', level: 2 },
      { type: 'taskList', items: ['待办事项1', '待办事项2'] },
      { type: 'heading', content: '下次会议', level: 2 },
      { type: 'paragraph', content: '时间：' },
    ]),
    category: 'builtin',
    createdAt: Date.now(),
  },
  {
    id: 'todo',
    name: '待办清单',
    icon: 'check-square',
    description: '管理任务和待办',
    content: createContent([
      { type: 'heading', content: '待办清单', level: 1 },
      { type: 'paragraph', content: '截止日期：' },
      { type: 'horizontalRule' },
      { type: 'heading', content: '紧急且重要', level: 2 },
      { type: 'taskList', items: ['任务1', '任务2'] },
      { type: 'heading', content: '重要不紧急', level: 2 },
      { type: 'taskList', items: ['任务1', '任务2'] },
      { type: 'heading', content: '紧急不重要', level: 2 },
      { type: 'taskList', items: ['任务1', '任务2'] },
      { type: 'heading', content: '不紧急不重要', level: 2 },
      { type: 'taskList', items: ['任务1'] },
    ]),
    category: 'builtin',
    createdAt: Date.now(),
  },
  {
    id: 'reading',
    name: '读书笔记',
    icon: 'book-marked',
    description: '记录阅读心得',
    content: createContent([
      { type: 'heading', content: '书名', level: 1 },
      { type: 'paragraph', content: '作者：' },
      { type: 'paragraph', content: '评分：' },
      { type: 'horizontalRule' },
      { type: 'heading', content: '核心观点', level: 2 },
      { type: 'bulletList', items: ['观点1', '观点2', '观点3'] },
      { type: 'heading', content: '精彩摘录', level: 2 },
      { type: 'blockquote', content: '摘录内容...' },
      { type: 'heading', content: '我的思考', level: 2 },
      { type: 'paragraph' },
      { type: 'heading', content: '行动指南', level: 2 },
      { type: 'taskList', items: ['行动1', '行动2'] },
    ]),
    category: 'builtin',
    createdAt: Date.now(),
  },
  {
    id: 'weekly',
    name: '周报',
    icon: 'bar-chart-2',
    description: '总结一周工作',
    content: createContent([
      { type: 'heading', content: '周报', level: 1 },
      { type: 'paragraph', content: '日期：' },
      { type: 'paragraph', content: '部门：' },
      { type: 'horizontalRule' },
      { type: 'heading', content: '本周完成', level: 2 },
      { type: 'bulletList', items: ['完成事项1', '完成事项2', '完成事项3'] },
      { type: 'heading', content: '遇到的问题', level: 2 },
      { type: 'bulletList', items: ['问题1：', '问题2：'] },
      { type: 'heading', content: '下周计划', level: 2 },
      { type: 'taskList', items: ['计划1', '计划2', '计划3'] },
      { type: 'heading', content: '需要的支持', level: 2 },
      { type: 'paragraph' },
    ]),
    category: 'builtin',
    createdAt: Date.now(),
  },
  {
    id: 'project',
    name: '项目文档',
    icon: 'rocket',
    description: '项目规划和跟踪',
    content: createContent([
      { type: 'heading', content: '项目名称', level: 1 },
      { type: 'paragraph', content: '项目负责人：' },
      { type: 'paragraph', content: '开始日期：' },
      { type: 'paragraph', content: '预计完成：' },
      { type: 'horizontalRule' },
      { type: 'heading', content: '项目目标', level: 2 },
      { type: 'bulletList', items: ['目标1', '目标2'] },
      { type: 'heading', content: '里程碑', level: 2 },
      { type: 'taskList', items: ['阶段1：', '阶段2：', '阶段3：'] },
      { type: 'heading', content: '风险和挑战', level: 2 },
      { type: 'bulletList', items: ['风险1：', '风险2：'] },
      { type: 'heading', content: '资源需求', level: 2 },
      { type: 'paragraph' },
    ]),
    category: 'builtin',
    createdAt: Date.now(),
  },
  {
    id: 'code',
    name: '代码笔记',
    icon: 'code',
    description: '记录技术学习',
    content: createContent([
      { type: 'heading', content: '技术主题', level: 1 },
      { type: 'paragraph', content: '学习日期：' },
      { type: 'horizontalRule' },
      { type: 'heading', content: '核心概念', level: 2 },
      { type: 'paragraph' },
      { type: 'heading', content: '代码示例', level: 2 },
      { type: 'paragraph', content: '```javascript\n// 在这里写代码\n```' },
      { type: 'heading', content: '常见问题', level: 2 },
      { type: 'bulletList', items: ['Q1：', 'A1：', 'Q2：', 'A2：'] },
      { type: 'heading', content: '参考资源', level: 2 },
      { type: 'bulletList', items: ['资源1', '资源2'] },
      { type: 'heading', content: '总结', level: 2 },
      { type: 'paragraph' },
    ]),
    category: 'builtin',
    createdAt: Date.now(),
  },
];

// 获取所有模板（包括自定义模板）
export function getTemplates(): Template[] {
  const customTemplates = getCustomTemplates();
  return [...builtinTemplates, ...customTemplates];
}

// 获取自定义模板
export function getCustomTemplates(): Template[] {
  try {
    const stored = localStorage.getItem('inkflow-templates');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// 保存自定义模板
export function saveCustomTemplate(template: Omit<Template, 'id' | 'category' | 'createdAt'>): Template {
  const customTemplates = getCustomTemplates();
  const newTemplate: Template = {
    ...template,
    id: `custom-${Date.now()}`,
    category: 'custom',
    createdAt: Date.now(),
  };
  customTemplates.push(newTemplate);
  localStorage.setItem('inkflow-templates', JSON.stringify(customTemplates));
  return newTemplate;
}

// 删除自定义模板
export function deleteCustomTemplate(id: string): void {
  const customTemplates = getCustomTemplates().filter(t => t.id !== id);
  localStorage.setItem('inkflow-templates', JSON.stringify(customTemplates));
}
