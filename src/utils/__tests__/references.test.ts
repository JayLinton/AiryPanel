import { describe, it, expect } from 'vitest'
import { countReferences, getReferenceMap } from '../references'
import type { Document } from '@/types'

describe('references', () => {
  const mockDocuments: Document[] = [
    {
      id: '1',
      title: '文档一',
      content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"这是[[文档二]]的引用"}]}]}',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: '2',
      title: '文档二',
      content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"这是[[文档一]]和[[文档三]]的引用"}]}]}',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: '3',
      title: '文档三',
      content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"没有引用"}]}]}',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ]

  describe('countReferences', () => {
    it('应该正确计算文档被引用的次数', () => {
      // 文档二被文档一引用了一次
      expect(countReferences('2', mockDocuments)).toBe(1)
    })

    it('应该返回0当文档没有被引用时', () => {
      // 创建一个没有被引用的文档
      expect(countReferences('4', mockDocuments)).toBe(0)
    })

    it('应该处理多个引用', () => {
      // 文档一被文档二引用了一次
      expect(countReferences('1', mockDocuments)).toBe(1)
    })

    it('应该处理空文档列表', () => {
      expect(countReferences('1', [])).toBe(0)
    })

    it('应该处理文档内容为空的情况', () => {
      const docsWithEmptyContent: Document[] = [
        {
          id: '1',
          title: '空文档',
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]
      expect(countReferences('1', docsWithEmptyContent)).toBe(0)
    })
  })

  describe('getReferenceMap', () => {
    it('应该返回正确的引用关系图', () => {
      const refMap = getReferenceMap(mockDocuments)

      // 文档一被文档二引用
      expect(refMap.get('1')).toContain('2')

      // 文档二被文档一引用
      expect(refMap.get('2')).toContain('1')

      // 文档三被文档二引用
      expect(refMap.get('3')).toContain('2')
    })

    it('应该处理空文档列表', () => {
      const refMap = getReferenceMap([])
      expect(refMap.size).toBe(0)
    })

    it('应该不包含自引用', () => {
      const selfRefDoc: Document[] = [
        {
          id: '1',
          title: '自引用',
          content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"[[自引用]]"}]}]}',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]
      const refMap = getReferenceMap(selfRefDoc)
      // 自引用不应该被计入
      expect(refMap.get('1')).toBeUndefined()
    })
  })
})