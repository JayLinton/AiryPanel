import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AppProvider, useApp } from '../AppContext'

// Mock API client
vi.mock('@/api/client', () => ({
  authAPI: {
    register: vi.fn(),
    login: vi.fn(),
    getMe: vi.fn(),
  },
  notesAPI: {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn(),
    create: vi.fn().mockResolvedValue({ id: 'test-uuid-123', title: '未命名笔记', content: '', icon: '', tags: [], isFavorite: false, deletedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    permanentDelete: vi.fn().mockResolvedValue({}),
    restore: vi.fn().mockResolvedValue({}),
  },
  settingsAPI: {
    get: vi.fn().mockResolvedValue({ userId: 'test', theme: 'light' }),
    update: vi.fn().mockResolvedValue({}),
  },
  getToken: vi.fn(),
  setToken: vi.fn(),
  clearToken: vi.fn(),
}))

const mockUser = {
  id: 'test-user-id',
  username: 'testuser',
  email: 'test@test.com',
  avatar: '',
}

describe('AppContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AppProvider user={mockUser}>{children}</AppProvider>
  )

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useApp hook', () => {
    it('应该在 AppProvider 内正常工作', () => {
      const { result } = renderHook(() => useApp(), { wrapper })
      expect(result.current.state).toBeDefined()
      expect(result.current.dispatch).toBeDefined()
    })

    it('应该在 AppProvider 外抛出错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      expect(() => {
        renderHook(() => useApp())
      }).toThrow('useApp 必须在 AppProvider 内使用')
      consoleSpy.mockRestore()
    })
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const { result } = renderHook(() => useApp(), { wrapper })
      const { state } = result.current

      expect(state.currentDocId).toBeNull()
      expect(state.documents).toEqual([])
      expect(state.sidebarOpen).toBe(true)
      expect(state.theme).toBe('light')
      expect(state.filterTag).toBeNull()
      expect(state.showTrash).toBe(false)
    })

    it('应该支持深色主题', () => {
      const { result } = renderHook(() => useApp(), { wrapper })

      act(() => {
        result.current.dispatch({ type: 'SET_THEME', payload: 'dark' })
      })

      expect(result.current.state.theme).toBe('dark')
    })
  })

  describe('dispatch actions', () => {
    it('SET_CURRENT_DOC 应该更新当前文档 ID', () => {
      const { result } = renderHook(() => useApp(), { wrapper })

      act(() => {
        result.current.dispatch({ type: 'SET_CURRENT_DOC', payload: 'doc-123' })
      })

      expect(result.current.state.currentDocId).toBe('doc-123')
    })

    it('SET_DOCUMENTS 应该更新文档列表', () => {
      const { result } = renderHook(() => useApp(), { wrapper })
      const docs = [
        { id: '1', title: '文档1', content: '', isFavorite: false, createdAt: 1, updatedAt: 1 },
        { id: '2', title: '文档2', content: '', isFavorite: false, createdAt: 2, updatedAt: 2 },
      ]

      act(() => {
        result.current.dispatch({ type: 'SET_DOCUMENTS', payload: docs as any })
      })

      expect(result.current.state.documents).toEqual(docs)
    })

    it('TOGGLE_SIDEBAR 应该切换侧边栏状态', () => {
      const { result } = renderHook(() => useApp(), { wrapper })

      expect(result.current.state.sidebarOpen).toBe(true)

      act(() => {
        result.current.dispatch({ type: 'TOGGLE_SIDEBAR' })
      })

      expect(result.current.state.sidebarOpen).toBe(false)
    })

    it('SET_THEME 应该设置主题', () => {
      const { result } = renderHook(() => useApp(), { wrapper })

      act(() => {
        result.current.dispatch({ type: 'SET_THEME', payload: 'dark' })
      })

      expect(result.current.state.theme).toBe('dark')
    })

    it('SET_FILTER_TAG 应该设置过滤标签', () => {
      const { result } = renderHook(() => useApp(), { wrapper })

      act(() => {
        result.current.dispatch({ type: 'SET_FILTER_TAG', payload: '工作' })
      })

      expect(result.current.state.filterTag).toBe('工作')
    })

    it('TOGGLE_TRASH 应该切换回收站显示', () => {
      const { result } = renderHook(() => useApp(), { wrapper })

      expect(result.current.state.showTrash).toBe(false)

      act(() => {
        result.current.dispatch({ type: 'TOGGLE_TRASH' })
      })

      expect(result.current.state.showTrash).toBe(true)
    })
  })
})
