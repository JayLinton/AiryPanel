import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 数据目录
const dataDir = join(__dirname, '../../data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// 数据结构
interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar: string;
  createdAt: string;
}

interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  icon: string;
  tags: string[];
  isFavorite: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserSettings {
  userId: string;
  theme: string;
}

interface Schema {
  users: User[];
  notes: Note[];
  settings: UserSettings[];
}

// 默认数据
const defaultData: Schema = {
  users: [],
  notes: [],
  settings: [],
};

// 创建数据库
const dbFile = join(dataDir, 'db.json');
const adapter = new JSONFile<Schema>(dbFile);
const db = new Low<Schema>(adapter, defaultData);

// 初始化
await db.read();

export { db };
export type { User, Note, UserSettings, Schema };
