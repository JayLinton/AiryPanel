import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AppProvider, useApp } from '../AppContext'

// Mock database
vi.mock('@/db/database', () => ({
  documentDB: {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn(),
    create: vi.fn().mockResolvedValue('test-id'),
    update: vi.fn().mockResolvedValue(1),
    delete: vi.fn().mockResolvedValue(undefined),
    count: vi.fn().mockResolvedValue(0),
  },
  settingsDB: {
    get: vi.fn().mockResolvedValue(undefined),
    set: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}))

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('test-uuid-123'),
}))

describe('AppContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AppProvider>{children}</AppProvider>
  )

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('useApp hook', () => {
    it('应该在 AppProvider 内正常工作', () => {
      const { result } = renderHook(() => useApp(), { wrapper })
      expect(result.current.state).toBeDefined()
      expect(result.current.dispatch).toBeDefined()
    })

    it('应该在 AppProvider 外抛出错误', () => {
      // 抑制 console.error
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
        result.current.dispatch({ type: 'SET_DOCUMENTS', payload: docs })
      })

      expect(result.current.state.documents).toEqual(docs)
    })

    it('ADD_DOCUMENT 应该添加文档到列表', () => {
      const { result } = renderHook(() => useApp(), { wrapper })
      const doc = { id: '1', title: '新文档', content: '', isFavorite: false, createdAt: 1, updatedAt: 1 }

      act(() => {
        result.current.dispatch({ type: 'ADD_DOCUMENT', payload: doc })
      })

      expect(result.current.state.documents).toHaveLength(1)
      expect(result.current.state.documents[0]).toEqual(doc)
    })

    it('UPDATE_DOCUMENT 应该更新指定文档', () => {
      const { result } = renderHook(() => useApp(), { wrapper })
      const doc = { id: '1', title: '原始标题', content: '', isFavorite: false, createdAt: 1, updatedAt: 1 }

      act(() => {
        result.current.dispatch({ type: 'ADD_DOCUMENT', payload: doc })
      })

      act(() => {
        result.current.dispatch({
          type: 'UPDATE_DOCUMENT',
          payload: { id: '1', updates: { title: '更新后的标题' } },
        })
      })

      expect(result.current.state.documents[0].title).toBe('更新后的标题')
    })

    it('DELETE_DOCUMENT 应该删除指定文档', () => {
      const { result } = renderHook(() => useApp(), { wrapper })
      const doc1 = { id: '1', title: '文档1', content: '', isFavorite: false, createdAt: 1, updatedAt: 1 }
      const doc2 = { id: '2', title: '文档2', content: '', isFavorite: false, createdAt: 2, updatedAt: 2 }

      act(() => {
        result.current.dispatch({ type: 'ADD_DOCUMENT', payload: doc1 })
        result.current.dispatch({ type: 'ADD_DOCUMENT', payload: doc2 })
      })

      act(() => {
        result.current.dispatch({ type: 'DELETE_DOCUMENT', payload: '1' })
      })

      expect(result.current.state.documents).toHaveLength(1)
      expect(result.current.state.documents[0].id).toBe('2')
    })

    it('SOFT_DELETE_DOCUMENT 应该标记文档为已删除', () => {
      const { result } = renderHook(() => useApp(), { wrapper })
      const doc = { id: '1', title: '文档1', content: '', isFavorite: false, createdAt: 1, updatedAt: 1 }

      act(() => {
        result.current.dispatch({ type: 'ADD_DOCUMENT', payload: doc })
      })

      act(() => {
        result.current.dispatch({ type: 'SOFT_DELETE_DOCUMENT', payload: '1' })
      })

      expect(result.current.state.documents[0].deletedAt).toBeDefined()
    })

    it('RESTORE_DOCUMENT 应该恢复已删除的文档', () => {
      const { result } = renderHook(() => useApp(), { wrapper })
      const doc = { id: '1', title: '文档1', content: '', isFavorite: false, createdAt: 1, updatedAt: 1, deletedAt: 1000 }

      act(() => {
        result.current.dispatch({ type: 'ADD_DOCUMENT', payload: doc })
      })

      act(() => {
        result.current.dispatch({ type: 'RESTORE_DOCUMENT', payload: '1' })
      })

      expect(result.current.state.documents[0].deletedAt).toBeUndefined()
    })

    it('TOGGLE_SIDEBAR 应该切换侧边栏状态', () => {
      const { result } = renderHook(() => useApp(), { wrapper })

      expect(result.current.state.sidebarOpen).toBe(true)

      act(() => {
        result.current.dispatch({ type: 'TOGGLE_SIDEBAR' })
      })

      expect(result.current.state.sidebarOpen).toBe(false)

      act(() => {
        result.current.dispatch({ type: 'TOGGLE_SIDEBAR' })
      })

      expect(result.current.state.sidebarOpen).toBe(true)
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

  describe('Provider 方法', () => {
    it('createDocument 应该创建新文档', async () => {
      const { result } = renderHook(() => useApp(), { wrapper })

      // 等待初始化完成（会自动创建一个文档）
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      const initialCount = result.current.state.documents.length

      let docId: string
      await act(async () => {
        docId = await result.current.createDocument()
      })

      expect(docId!).toBe('test-uuid-123')
      expect(result.current.state.documents).toHaveLength(initialCount + 1)
      expect(result.current.state.currentDocId).toBe('test-uuid-123')
    })

    it('toggleTheme 应该切换主题', async () => {
      const { result } = renderHook(() => useApp(), { wrapper })

      expect(result.current.state.theme).toBe('light')

      await act(async () => {
        await result.current.toggleTheme()
      })

      expect(result.current.state.theme).toBe('dark')
    })

    it('softDeleteDocument 应该软删除文档', async () => {
      const { documentDB } = await import('@/db/database')
      const { result } = renderHook(() => useApp(), { wrapper })

      // 等待初始化完成
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      // 先创建一个文档
      await act(async () => {
        await result.current.createDocument()
      })

      const docId = result.current.state.documents[0].id

      await act(async () => {
        await result.current.softDeleteDocument(docId)
      })

      const deletedDoc = result.current.state.documents.find(d => d.id === docId)
      expect(deletedDoc?.deletedAt).toBeDefined()
      expect(documentDB.update).toHaveBeenCalledWith(docId, { deletedAt: expect.any(Number) })
    })
  })
})
