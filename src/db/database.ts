import Dexie from 'dexie';
import type { Document } from '@/types';

// 设置数据结构
export interface Setting {
  key: string;
  value: string;
}

// 存储状态
export type StorageStatus = 'normal' | 'degraded' | 'error';

// 内存存储降级方案
const memoryStorage = {
  documents: new Map<string, Document>(),
  settings: new Map<string, string>(),
};

let useMemoryFallback = false;
let storageStatus: StorageStatus = 'normal';
let lastError: string | null = null;
let retryCount = 0;
const MAX_RETRIES = 3;

// 创建 Dexie 数据库实例
const db = new Dexie('ZenWriterDB');

// 定义表结构
db.version(1).stores({
  documents: 'id, title, createdAt, updatedAt',
});

db.version(2).stores({
  documents: 'id, title, createdAt, updatedAt',
  settings: 'key',
});

// 获取文档表
const documents = db.table<Document, string>('documents');

// 获取设置表
const settings = db.table<Setting, string>('settings');

// 触发错误事件
function triggerError(message: string, details?: string) {
  window.dispatchEvent(
    new CustomEvent('storage-error', {
      detail: { message, details, status: storageStatus },
    })
  );
}

// 触发状态变更事件
function triggerStatusChange(status: StorageStatus) {
  window.dispatchEvent(
    new CustomEvent('storage-status-change', {
      detail: { status },
    })
  );
}

// 重试逻辑
async function withRetry<T>(
  operation: () => Promise<T>,
  fallback: () => T,
  operationName: string
): Promise<T> {
  if (useMemoryFallback) {
    return fallback();
  }

  try {
    const result = await operation();
    // 成功后重置重试计数
    if (retryCount > 0) {
      retryCount = 0;
      storageStatus = 'normal';
      triggerStatusChange('normal');
    }
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`${operationName}失败:`, error);

    retryCount++;
    lastError = errorMessage;

    if (retryCount >= MAX_RETRIES) {
      storageStatus = 'degraded';
      useMemoryFallback = true;
      triggerError(
        '本地存储异常，已切换到临时存储模式',
        `错误: ${errorMessage}。建议导出备份数据。`
      );
      triggerStatusChange('degraded');
    } else {
      storageStatus = 'error';
      triggerError(
        `存储操作失败 (${retryCount}/${MAX_RETRIES})`,
        `操作: ${operationName}，错误: ${errorMessage}`
      );
      triggerStatusChange('error');
    }

    return fallback();
  }
}

// 数据库操作封装
export const documentDB = {
  // 获取所有文档
  async getAll(): Promise<Document[]> {
    return withRetry(
      () => documents.orderBy('updatedAt').reverse().toArray(),
      () => Array.from(memoryStorage.documents.values()).sort(
        (a, b) => b.updatedAt - a.updatedAt
      ),
      '获取文档列表'
    );
  },

  // 根据 ID 获取文档
  async getById(id: string): Promise<Document | undefined> {
    return withRetry(
      () => documents.get(id),
      () => memoryStorage.documents.get(id),
      '获取文档'
    );
  },

  // 创建文档
  async create(doc: Document): Promise<string> {
    return withRetry(
      () => documents.add(doc),
      () => {
        memoryStorage.documents.set(doc.id, doc);
        return doc.id;
      },
      '创建文档'
    );
  },

  // 更新文档
  async update(id: string, changes: Partial<Document>): Promise<number> {
    return withRetry(
      () => documents.update(id, changes),
      () => {
        const existing = memoryStorage.documents.get(id);
        if (existing) {
          memoryStorage.documents.set(id, { ...existing, ...changes });
          return 1;
        }
        return 0;
      },
      '更新文档'
    );
  },

  // 删除文档
  async delete(id: string): Promise<void> {
    await withRetry(
      async () => { await documents.delete(id); },
      () => {
        memoryStorage.documents.delete(id);
      },
      '删除文档'
    );
  },

  // 获取文档数量
  async count(): Promise<number> {
    return withRetry(
      () => documents.count(),
      () => memoryStorage.documents.size,
      '获取文档数量'
    );
  },
};

// 设置操作封装
export const settingsDB = {
  // 获取设置
  async get(key: string): Promise<string | undefined> {
    return withRetry(
      async () => {
        const setting = await settings.get(key);
        return setting?.value;
      },
      () => memoryStorage.settings.get(key),
      '获取设置'
    );
  },

  // 保存设置
  async set(key: string, value: string): Promise<void> {
    await withRetry(
      async () => { await settings.put({ key, value }); },
      () => {
        memoryStorage.settings.set(key, value);
      },
      '保存设置'
    );
  },

  // 删除设置
  async delete(key: string): Promise<void> {
    await withRetry(
      async () => { await settings.delete(key); },
      () => {
        memoryStorage.settings.delete(key);
      },
      '删除设置'
    );
  },
};

// 获取存储状态
export function getStorageStatus(): {
  status: StorageStatus;
  isMemoryFallback: boolean;
  lastError: string | null;
  retryCount: number;
} {
  return {
    status: storageStatus,
    isMemoryFallback: useMemoryFallback,
    lastError,
    retryCount,
  };
}

// 尝试恢复到 IndexedDB
export async function tryRecoverStorage(): Promise<boolean> {
  if (!useMemoryFallback) {
    return true;
  }

  try {
    // 测试 IndexedDB 是否可用
    await db.open();

    // 如果成功，迁移内存数据到 IndexedDB
    const docs = Array.from(memoryStorage.documents.values());
    for (const doc of docs) {
      await documents.put(doc);
    }

    const settingsEntries = Array.from(memoryStorage.settings.entries());
    for (const [key, value] of settingsEntries) {
      await settings.put({ key, value });
    }

    // 恢复成功
    useMemoryFallback = false;
    storageStatus = 'normal';
    retryCount = 0;
    lastError = null;

    triggerStatusChange('normal');
    return true;
  } catch (error) {
    console.error('恢复存储失败:', error);
    return false;
  }
}

// 导出数据（用于备份）
export async function exportData(): Promise<{
  documents: Document[];
  settings: Record<string, string>;
  exportedAt: number;
}> {
  const docs = await documentDB.getAll();
  const settingsMap: Record<string, string> = {};

  // 获取所有设置
  const theme = await settingsDB.get('theme');
  if (theme) settingsMap.theme = theme;

  return {
    documents: docs,
    settings: settingsMap,
    exportedAt: Date.now(),
  };
}

// 导入数据（从备份恢复）
export async function importData(data: {
  documents?: Document[];
  settings?: Record<string, string>;
}): Promise<{ success: boolean; message: string }> {
  try {
    if (data.documents) {
      for (const doc of data.documents) {
        await documentDB.create(doc);
      }
    }

    if (data.settings) {
      for (const [key, value] of Object.entries(data.settings)) {
        await settingsDB.set(key, value);
      }
    }

    return { success: true, message: '数据导入成功' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `导入失败: ${errorMessage}` };
  }
}

export default db;
