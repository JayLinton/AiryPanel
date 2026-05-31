import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'inkflow-secret-key';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// 管理员认证中间件
function adminAuth(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    next();
  } catch {
    return res.status(401).json({ error: 'Token 已过期' });
  }
}

// 管理员登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: '密码错误' });
    }

    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ token });
  } catch (error) {
    console.error('管理员登录失败:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// 验证管理员认证
router.get('/verify', adminAuth, (_req: Request, res: Response) => {
  res.json({ valid: true });
});

// 获取用户列表
router.get('/users', adminAuth, async (_req: Request, res: Response) => {
  try {
    await db.read();

    const users = db.data.users.map(user => {
      const noteCount = db.data.notes.filter(n => n.userId === user.id).length;
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        noteCount,
      };
    });

    res.json(users);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// 删除用户
router.delete('/users/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    await db.read();

    const userId = req.params.id;
    const userIndex = db.data.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const user = db.data.users[userIndex];
    const noteCount = db.data.notes.filter(n => n.userId === userId).length;

    // 删除用户
    db.data.users.splice(userIndex, 1);

    // 删除用户的笔记
    db.data.notes = db.data.notes.filter(n => n.userId !== userId);

    // 删除用户的设置
    db.data.settings = db.data.settings.filter(s => s.userId !== userId);

    await db.write();

    res.json({
      message: '用户已删除',
      deletedUser: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      deletedNotes: noteCount,
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ error: '删除用户失败' });
  }
});

// 获取统计数据
router.get('/stats', adminAuth, async (_req: Request, res: Response) => {
  try {
    await db.read();

    const totalUsers = db.data.users.length;
    const totalNotes = db.data.notes.length;
    const activeNotes = db.data.notes.filter(n => !n.deletedAt).length;
    const deletedNotes = db.data.notes.filter(n => n.deletedAt).length;

    // 最近 7 天注册的用户
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentUsers = db.data.users.filter(u => u.createdAt > sevenDaysAgo).length;

    res.json({
      totalUsers,
      totalNotes,
      activeNotes,
      deletedNotes,
      recentUsers,
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

export default router;
