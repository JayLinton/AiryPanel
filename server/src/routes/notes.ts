import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// 所有路由需要认证
router.use(authMiddleware);

// 获取笔记列表
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    await db.read();

    const userId = req.userId!;
    const notes = db.data.notes.filter(n => n.userId === userId);

    res.json(notes);
  } catch (error) {
    console.error('获取笔记列表失败:', error);
    res.status(500).json({ error: '获取笔记列表失败' });
  }
});

// 获取单个笔记
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await db.read();

    const note = db.data.notes.find(n => n.id === req.params.id && n.userId === req.userId);
    if (!note) {
      return res.status(404).json({ error: '笔记不存在' });
    }

    res.json(note);
  } catch (error) {
    console.error('获取笔记失败:', error);
    res.status(500).json({ error: '获取笔记失败' });
  }
});

// 创建笔记
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    await db.read();

    const userId = req.userId!;
    const now = new Date().toISOString();

    const note = {
      id: uuidv4(),
      userId,
      title: req.body.title || '未命名笔记',
      content: req.body.content || '',
      icon: req.body.icon || '',
      tags: req.body.tags || [],
      isFavorite: req.body.isFavorite || false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    db.data.notes.push(note);
    await db.write();

    res.status(201).json(note);
  } catch (error) {
    console.error('创建笔记失败:', error);
    res.status(500).json({ error: '创建笔记失败' });
  }
});

// 更新笔记
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await db.read();

    const noteIndex = db.data.notes.findIndex(
      n => n.id === req.params.id && n.userId === req.userId
    );

    if (noteIndex === -1) {
      return res.status(404).json({ error: '笔记不存在' });
    }

    const updates = req.body;
    const note = db.data.notes[noteIndex];

    // 更新字段
    if (updates.title !== undefined) note.title = updates.title;
    if (updates.content !== undefined) note.content = updates.content;
    if (updates.icon !== undefined) note.icon = updates.icon;
    if (updates.tags !== undefined) note.tags = updates.tags;
    if (updates.isFavorite !== undefined) note.isFavorite = updates.isFavorite;
    if (updates.deletedAt !== undefined) note.deletedAt = updates.deletedAt;
    note.updatedAt = new Date().toISOString();

    db.data.notes[noteIndex] = note;
    await db.write();

    res.json(note);
  } catch (error) {
    console.error('更新笔记失败:', error);
    res.status(500).json({ error: '更新笔记失败' });
  }
});

// 删除笔记（软删除）
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await db.read();

    const noteIndex = db.data.notes.findIndex(
      n => n.id === req.params.id && n.userId === req.userId
    );

    if (noteIndex === -1) {
      return res.status(404).json({ error: '笔记不存在' });
    }

    db.data.notes[noteIndex].deletedAt = new Date().toISOString();
    await db.write();

    res.json({ message: '已删除' });
  } catch (error) {
    console.error('删除笔记失败:', error);
    res.status(500).json({ error: '删除笔记失败' });
  }
});

// 永久删除笔记
router.delete('/:id/permanent', async (req: AuthRequest, res: Response) => {
  try {
    await db.read();

    const noteIndex = db.data.notes.findIndex(
      n => n.id === req.params.id && n.userId === req.userId
    );

    if (noteIndex === -1) {
      return res.status(404).json({ error: '笔记不存在' });
    }

    db.data.notes.splice(noteIndex, 1);
    await db.write();

    res.json({ message: '已永久删除' });
  } catch (error) {
    console.error('永久删除笔记失败:', error);
    res.status(500).json({ error: '永久删除笔记失败' });
  }
});

// 恢复笔记
router.post('/:id/restore', async (req: AuthRequest, res: Response) => {
  try {
    await db.read();

    const noteIndex = db.data.notes.findIndex(
      n => n.id === req.params.id && n.userId === req.userId
    );

    if (noteIndex === -1) {
      return res.status(404).json({ error: '笔记不存在' });
    }

    db.data.notes[noteIndex].deletedAt = null;
    await db.write();

    res.json(db.data.notes[noteIndex]);
  } catch (error) {
    console.error('恢复笔记失败:', error);
    res.status(500).json({ error: '恢复笔记失败' });
  }
});

export default router;
