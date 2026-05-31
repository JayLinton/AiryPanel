// 文档数据结构
export interface Document {
  id: string;
  title: string;
  content: string; // TipTap JSON 字符串
  icon?: string; // emoji 图标
  cover?: string; // 封面图 URL 或渐变色
  tags?: string[]; // 标签数组
  isFavorite?: boolean; // 是否收藏
  deletedAt?: number; // 软删除时间
  accessedAt?: number; // 最后访问时间
  cursorPosition?: number; // 光标位置
  createdAt: number;
  updatedAt: number;
}

// 主题类型
export type Theme = 'light' | 'dark';

// 应用状态
export interface AppState {
  currentDocId: string | null;
  documents: Document[];
  sidebarOpen: boolean;
  theme: Theme;
  filterTag: string | null; // 筛选标签
  showTrash: boolean; // 是否显示回收站
}

// Action 类型
export type AppAction =
  | { type: 'SET_CURRENT_DOC'; payload: string | null }
  | { type: 'SET_DOCUMENTS'; payload: Document[] }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_DOCUMENT'; payload: { id: string; updates: Partial<Document> } }
  | { type: 'DELETE_DOCUMENT'; payload: string }
  | { type: 'SOFT_DELETE_DOCUMENT'; payload: string }
  | { type: 'RESTORE_DOCUMENT'; payload: string }
  | { type: 'PERMANENT_DELETE_DOCUMENT'; payload: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_FILTER_TAG'; payload: string | null }
  | { type: 'TOGGLE_TRASH' };

// 模板类型
export interface Template {
  id: string;
  name: string;
  icon: string;
  description: string;
  content: string; // TipTap JSON 字符串
  category: 'builtin' | 'custom';
  createdAt: number;
}
