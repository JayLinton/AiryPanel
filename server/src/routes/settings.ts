import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// 获取设置
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    await db.read();

    const settings = db.data.settings.find(s => s.userId === req.userId);
    res.json(settings || { userId: req.userId, theme: 'light' });
  } catch (error) {
    console.error('获取设置失败:', error);
    res.status(500).json({ error: '获取设置失败' });
  }
});

// 更新设置
router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    await db.read();

    const userId = req.userId!;
    const index = db.data.settings.findIndex(s => s.userId === userId);

    if (index === -1) {
      db.data.settings.push({ userId, theme: req.body.theme || 'light' });
    } else {
      if (req.body.theme !== undefined) {
        db.data.settings[index].theme = req.body.theme;
      }
    }

    await db.write();

    const settings = db.data.settings.find(s => s.userId === userId);
    res.json(settings);
  } catch (error) {
    console.error('更新设置失败:', error);
    res.status(500).json({ error: '更新设置失败' });
  }
});

export default router;
