import { describe, it, expect, beforeEach, vi } from 'vitest'

// 创建 mock 表实例
const mockTable = {
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  toArray: vi.fn().mockResolvedValue([]),
  orderBy: vi.fn().mockReturnThis(),
  reverse: vi.fn().mockReturnThis(),
  count: vi.fn().mockResolvedValue(0),
  add: vi.fn(),
  update: vi.fn(),
}

// Mock Dexie 为一个类
vi.mock('dexie', () => {
  class MockDexie {
    version() {
      return { stores: vi.fn() }
    }
    table() {
      return mockTable
    }
  }
  return { default: MockDexie }
})

describe('database', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('模块导出', () => {
    it('应该导出 documentDB', async () => {
      const module = await import('../database')
      expect(module.documentDB).toBeDefined()
    })

    it('应该导出 settingsDB', async () => {
      const module = await import('../database')
      expect(module.settingsDB).toBeDefined()
    })

    it('应该导出默认的 db 实例', async () => {
      const module = await import('../database')
      expect(module.default).toBeDefined()
    })
  })

  describe('documentDB API', () => {
    it('应该有 getAll 方法', async () => {
      const { documentDB } = await import('../database')
      expect(typeof documentDB.getAll).toBe('function')
    })

    it('应该有 getById 方法', async () => {
      const { documentDB } = await import('../database')
      expect(typeof documentDB.getById).toBe('function')
    })

    it('应该有 create 方法', async () => {
      const { documentDB } = await import('../database')
      expect(typeof documentDB.create).toBe('function')
    })

    it('应该有 update 方法', async () => {
      const { documentDB } = await import('../database')
      expect(typeof documentDB.update).toBe('function')
    })

    it('应该有 delete 方法', async () => {
      const { documentDB } = await import('../database')
      expect(typeof documentDB.delete).toBe('function')
    })

    it('应该有 count 方法', async () => {
      const { documentDB } = await import('../database')
      expect(typeof documentDB.count).toBe('function')
    })
  })

  describe('settingsDB API', () => {
    it('应该有 get 方法', async () => {
      const { settingsDB } = await import('../database')
      expect(typeof settingsDB.get).toBe('function')
    })

    it('应该有 set 方法', async () => {
      const { settingsDB } = await import('../database')
      expect(typeof settingsDB.set).toBe('function')
    })

    it('应该有 delete 方法', async () => {
      const { settingsDB } = await import('../database')
      expect(typeof settingsDB.delete).toBe('function')
    })
  })
})
