import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AppState, AppAction, Theme } from '@/types';
import { notesAPI, settingsAPI, clearToken, type User } from '@/api/client';

// 初始状态
const initialState: AppState = {
  currentDocId: null,
  documents: [],
  sidebarOpen: true,
  theme: 'light',
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
            ? state.documents.find((doc) => doc.id !== action.payload && !doc.deletedAt)?.id ?? null
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
  logout: () => void;
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
}

// Provider 组件
export function AppProvider({ children, user: _user }: { children: ReactNode; user: User }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 初始化：加载笔记和设置
  useEffect(() => {
    async function initialize() {
      try {
        // 加载设置
        const settings = await settingsAPI.get();
        if (settings.theme === 'dark' || settings.theme === 'light') {
          dispatch({ type: 'SET_THEME', payload: settings.theme as Theme });
          applyTheme(settings.theme as Theme);
        }

        // 加载笔记
        const notes = await notesAPI.getAll();
        const docs = notes
          .filter(n => !n.deletedAt)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .map(n => ({
            id: n.id,
            title: n.title,
            content: n.content,
            icon: n.icon,
            tags: n.tags,
            isFavorite: n.isFavorite,
            deletedAt: n.deletedAt ? new Date(n.deletedAt).getTime() : undefined,
            accessedAt: new Date(n.updatedAt).getTime(),
            createdAt: new Date(n.createdAt).getTime(),
            updatedAt: new Date(n.updatedAt).getTime(),
          }));

        const deletedDocs = notes
          .filter(n => n.deletedAt)
          .map(n => ({
            id: n.id,
            title: n.title,
            content: n.content,
            icon: n.icon,
            tags: n.tags,
            isFavorite: n.isFavorite,
            deletedAt: new Date(n.deletedAt!).getTime(),
            accessedAt: new Date(n.updatedAt).getTime(),
            createdAt: new Date(n.createdAt).getTime(),
            updatedAt: new Date(n.updatedAt).getTime(),
          }));

        dispatch({ type: 'SET_DOCUMENTS', payload: [...docs, ...deletedDocs] });

        if (docs.length > 0) {
          dispatch({ type: 'SET_CURRENT_DOC', payload: docs[0].id });
        }
      } catch (error) {
        console.error('初始化失败:', error);
      }
    }
    initialize();
  }, []);

  // 创建文档
  async function createDocument(): Promise<string> {
    const note = await notesAPI.create({
      title: '未命名笔记',
      content: '',
    });

    const doc = {
      id: note.id,
      title: note.title,
      content: note.content,
      icon: note.icon,
      tags: note.tags,
      isFavorite: note.isFavorite,
      accessedAt: new Date(note.updatedAt).getTime(),
      createdAt: new Date(note.createdAt).getTime(),
      updatedAt: new Date(note.updatedAt).getTime(),
    };

    dispatch({ type: 'ADD_DOCUMENT', payload: doc });
    dispatch({ type: 'SET_CURRENT_DOC', payload: doc.id });
    return doc.id;
  }

  // 软删除文档
  async function softDeleteDocument(id: string): Promise<void> {
    dispatch({ type: 'SOFT_DELETE_DOCUMENT', payload: id });
    try {
      await notesAPI.update(id, { deletedAt: new Date().toISOString() });
    } catch (error) {
      console.error('软删除失败:', error);
    }
  }

  // 恢复文档
  async function restoreDocument(id: string): Promise<void> {
    dispatch({ type: 'RESTORE_DOCUMENT', payload: id });
    try {
      await notesAPI.restore(id);
    } catch (error) {
      console.error('恢复失败:', error);
    }
  }

  // 永久删除
  async function permanentDeleteDocument(id: string): Promise<void> {
    dispatch({ type: 'PERMANENT_DELETE_DOCUMENT', payload: id });
    try {
      await notesAPI.permanentDelete(id);
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
      await notesAPI.update(id, { isFavorite: newValue });
    } catch (error) {
      console.error('更新收藏失败:', error);
    }
  }

  // 更新访问时间
  async function updateAccessTime(id: string): Promise<void> {
    dispatch({
      type: 'UPDATE_DOCUMENT',
      payload: { id, updates: { accessedAt: Date.now() } },
    });
  }

  // 切换主题
  async function toggleTheme(): Promise<void> {
    const newTheme: Theme = state.theme === 'light' ? 'dark' : 'light';
    dispatch({ type: 'SET_THEME', payload: newTheme });
    applyTheme(newTheme);
    try {
      await settingsAPI.update({ theme: newTheme });
    } catch (error) {
      console.error('保存主题设置失败:', error);
    }
  }

  // 退出登录
  function logout() {
    clearToken();
    window.location.reload();
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
        logout,
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
