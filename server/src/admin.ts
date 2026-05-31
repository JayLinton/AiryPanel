// 用户管理脚本
// 使用方法：npx tsx src/admin.ts list    - 列出所有用户
//         npx tsx src/admin.ts delete <email> - 删除用户

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFile = join(__dirname, '../data/db.json');

interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

interface Note {
  id: string;
  userId: string;
  title: string;
  [key: string]: any;
}

interface Schema {
  users: User[];
  notes: Note[];
  settings: any[];
}

const adapter = new JSONFile<Schema>(dbFile);
const db = new Low<Schema>(adapter, { users: [], notes: [], settings: [] });

async function main() {
  await db.read();

  const command = process.argv[2];

  switch (command) {
    case 'list':
      console.log('\n📋 用户列表：\n');
      if (db.data.users.length === 0) {
        console.log('  暂无用户');
      } else {
        db.data.users.forEach((user, index) => {
          const noteCount = db.data.notes.filter(n => n.userId === user.id).length;
          console.log(`  ${index + 1}. ${user.username} (${user.email})`);
          console.log(`     ID: ${user.id}`);
          console.log(`     笔记数: ${noteCount}`);
          console.log(`     注册时间: ${user.createdAt}`);
          console.log('');
        });
      }
      break;

    case 'delete':
      const email = process.argv[3];
      if (!email) {
        console.log('❌ 请提供邮箱地址');
        console.log('用法: npx tsx src/admin.ts delete <email>');
        process.exit(1);
      }

      const userIndex = db.data.users.findIndex(u => u.email === email);
      if (userIndex === -1) {
        console.log(`❌ 未找到邮箱为 ${email} 的用户`);
        process.exit(1);
      }

      const user = db.data.users[userIndex];
      const noteCount = db.data.notes.filter(n => n.userId === user.id).length;

      // 删除用户
      db.data.users.splice(userIndex, 1);

      // 删除用户的笔记
      db.data.notes = db.data.notes.filter(n => n.userId !== user.id);

      // 删除用户的设置
      db.data.settings = db.data.settings.filter(s => s.userId !== user.id);

      await db.write();

      console.log(`✅ 已删除用户：${user.username} (${email})`);
      console.log(`   同时删除了 ${noteCount} 篇笔记`);
      break;

    case 'delete-all-test':
      // 删除所有测试账号（邮箱包含 test 的）
      const testUsers = db.data.users.filter(u => u.email.includes('test'));
      if (testUsers.length === 0) {
        console.log('没有找到测试账号');
        break;
      }

      for (const user of testUsers) {
        db.data.notes = db.data.notes.filter(n => n.userId !== user.id);
        db.data.settings = db.data.settings.filter(s => s.userId !== user.id);
      }
      db.data.users = db.data.users.filter(u => !u.email.includes('test'));

      await db.write();

      console.log(`✅ 已删除 ${testUsers.length} 个测试账号`);
      testUsers.forEach(u => console.log(`  - ${u.username} (${u.email})`));
      break;

    case 'help':
    default:
      console.log(`
📝 Inkflow 用户管理工具

用法：
  npx tsx src/admin.ts list              列出所有用户
  npx tsx src/admin.ts delete <email>    删除指定用户
  npx tsx src/admin.ts delete-all-test   删除所有测试账号
  npx tsx src/admin.ts help              显示帮助
      `);
      break;
  }
}

main().catch(console.error);
