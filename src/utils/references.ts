import type { Document } from '@/types';

// 计算文档被引用的次数
export function countReferences(docId: string, documents: Document[]): number {
  let count = 0;

  documents.forEach((doc) => {
    if (!doc.content) return;

    try {
      // 在内容中搜索 [[title]] 格式的引用
      const content = doc.content;
      // 简单的文本搜索，实际应该解析 JSON
      const targetDoc = documents.find((d) => d.id === docId);
      if (!targetDoc) return;

      // 搜索 [[title]] 模式
      const pattern = `\\[\\[${escapeRegExp(targetDoc.title)}\\]\\]`;
      const regex = new RegExp(pattern, 'gi');
      const matches = content.match(regex);
      if (matches) {
        count += matches.length;
      }
    } catch {
      // 忽略解析错误
    }
  });

  return count;
}

// 转义正则表达式特殊字符
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 获取所有引用关系
export function getReferenceMap(documents: Document[]): Map<string, string[]> {
  const refMap = new Map<string, string[]>();

  documents.forEach((doc) => {
    if (!doc.content) return;

    documents.forEach((targetDoc) => {
      if (doc.id === targetDoc.id) return;

      const pattern = `\\[\\[${escapeRegExp(targetDoc.title)}\\]\\]`;
      const regex = new RegExp(pattern, 'gi');
      const matches = doc.content?.match(regex);

      if (matches && matches.length > 0) {
        const refs = refMap.get(targetDoc.id) || [];
        if (!refs.includes(doc.id)) {
          refs.push(doc.id);
        }
        refMap.set(targetDoc.id, refs);
      }
    });
  });

  return refMap;
}
