import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { AppState, AppAction, Document, Theme } from '@/types';
import { documentDB, settingsDB } from '@/db/database';

// 初始状态：从 localStorage 读取主题
const getInitialTheme = (): Theme => {
  try {
    const saved = localStorage.getItem('zenwriter-theme');
    return saved === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

const initialState: AppState = {
  currentDocId: null,
  documents: [],
  sidebarOpen: true,
  theme: getInitialTheme(),
  filterTag: null,
  showTrash: false,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_DOC':
      return { ...state, currentDocId: action.payload };
    case 'SET_DOCUMENTS':
      return { ...state, documents: action.payload };
    case 'ADD_DOCUMENT':
      return { ...state, documents: [action.payload, ...state.documents] };
    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map((doc) =>
          doc.id === action.payload.id ? { ...doc, ...action.payload.updates } : doc
        ),
      };
    case 'DELETE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter((doc) => doc.id !== action.payload),
        currentDocId:
          state.currentDocId === action.payload
            ? state.documents.find((doc) => doc.id !== action.payload)?.id ?? null
            : state.currentDocId,
      };
    case 'SOFT_DELETE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map((doc) =>
          doc.id === action.payload ? { ...doc, deletedAt: Date.now() } : doc
        ),
        currentDocId:
          state.currentDocId === action.payload
            ? state.documents.find((doc) => doc.id !== action.payload && !doc.deletedAt)?.id ?? null
            : state.currentDocId,
      };
    case 'RESTORE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map((doc) =>
          doc.id === action.payload ? { ...doc, deletedAt: undefined } : doc
        ),
      };
    case 'PERMANENT_DELETE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter((doc) => doc.id !== action.payload),
      };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_FILTER_TAG':
      return { ...state, filterTag: action.payload };
    case 'TOGGLE_TRASH':
      return { ...state, showTrash: !state.showTrash };
    default:
      return state;
  }
}

// Context 类型
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  createDocument: () => Promise<string>;
  deleteDocument: (id: string) => Promise<void>;
  softDeleteDocument: (id: string) => Promise<void>;
  restoreDocument: (id: string) => Promise<void>;
  permanentDeleteDocument: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  updateAccessTime: (id: string) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

// 创建 Context
const AppContext = createContext<AppContextType | null>(null);

// 应用主题到 DOM
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  try {
    localStorage.setItem('zenwriter-theme', theme);
  } catch {}
}

// Provider 组件
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 初始化时应用主题
  useEffect(() => {
    applyTheme(state.theme);
  }, []);

  // 初始化：加载文档列表
  useEffect(() => {
    async function initialize() {
      try {
        const savedTheme = await settingsDB.get('theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
          dispatch({ type: 'SET_THEME', payload: savedTheme as Theme });
          applyTheme(savedTheme as Theme);
        }

        const docs = await documentDB.getAll();
        dispatch({ type: 'SET_DOCUMENTS', payload: docs });

        // 过滤未删除的文档
        const activeDocs = docs.filter((doc) => !doc.deletedAt);

        if (activeDocs.length === 0) {
          const newDoc = await createDocumentInternal();
          dispatch({ type: 'ADD_DOCUMENT', payload: newDoc });
          dispatch({ type: 'SET_CURRENT_DOC', payload: newDoc.id });
        } else {
          // 按访问时间排序，选中最近访问的
          const sorted = [...activeDocs].sort((a, b) => (b.accessedAt || b.updatedAt) - (a.accessedAt || a.updatedAt));
          dispatch({ type: 'SET_CURRENT_DOC', payload: sorted[0].id });
        }
      } catch (error) {
        console.error('初始化失败:', error);
      }
    }
    initialize();
  }, []);

  // 创建文档（内部方法）
  async function createDocumentInternal(): Promise<Document> {
    const now = Date.now();
    const newDoc: Document = {
      id: uuidv4(),
      title: '未命名笔记',
      content: '',
      isFavorite: false,
      accessedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    await documentDB.create(newDoc);
    return newDoc;
  }

  // 创建文档（公开方法）
  async function createDocument(): Promise<string> {
    const newDoc = await createDocumentInternal();
    dispatch({ type: 'ADD_DOCUMENT', payload: newDoc });
    dispatch({ type: 'SET_CURRENT_DOC', payload: newDoc.id });
    return newDoc.id;
  }

  // 软删除文档
  async function softDeleteDocument(id: string): Promise<void> {
    const now = Date.now();
    dispatch({ type: 'SOFT_DELETE_DOCUMENT', payload: id });
    try {
      await documentDB.update(id, { deletedAt: now });
    } catch (error) {
      console.error('软删除失败:', error);
    }
  }

  // 恢复文档
  async function restoreDocument(id: string): Promise<void> {
    dispatch({ type: 'RESTORE_DOCUMENT', payload: id });
    try {
      await documentDB.update(id, { deletedAt: undefined });
    } catch (error) {
      console.error('恢复失败:', error);
    }
  }

  // 永久删除
  async function permanentDeleteDocument(id: string): Promise<void> {
    dispatch({ type: 'PERMANENT_DELETE_DOCUMENT', payload: id });
    try {
      await documentDB.delete(id);
    } catch (error) {
      console.error('永久删除失败:', error);
    }
  }

  // 删除文档（兼容旧代码）
  async function deleteDocument(id: string): Promise<void> {
    await softDeleteDocument(id);
  }

  // 切换收藏
  async function toggleFavorite(id: string): Promise<void> {
    const doc = state.documents.find((d) => d.id === id);
    if (!doc) return;

    const newValue = !doc.isFavorite;
    dispatch({
      type: 'UPDATE_DOCUMENT',
      payload: { id, updates: { isFavorite: newValue } },
    });
    try {
      await documentDB.update(id, { isFavorite: newValue });
    } catch (error) {
      console.error('更新收藏失败:', error);
    }
  }

  // 更新访问时间
  async function updateAccessTime(id: string): Promise<void> {
    const now = Date.now();
    dispatch({
      type: 'UPDATE_DOCUMENT',
      payload: { id, updates: { accessedAt: now } },
    });
    try {
      await documentDB.update(id, { accessedAt: now });
    } catch (error) {
      console.error('更新访问时间失败:', error);
    }
  }

  // 切换主题
  async function toggleTheme(): Promise<void> {
    const newTheme: Theme = state.theme === 'light' ? 'dark' : 'light';
    dispatch({ type: 'SET_THEME', payload: newTheme });
    applyTheme(newTheme);
    await settingsDB.set('theme', newTheme);
  }

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        createDocument,
        deleteDocument,
        softDeleteDocument,
        restoreDocument,
        permanentDeleteDocument,
        toggleFavorite,
        updateAccessTime,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// 自定义 Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp 必须在 AppProvider 内使用');
  }
  return context;
}
