import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db, type Note } from '../db/database.js';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth.js';
import { sendVerificationCode, verifyCode } from '../utils/email.js';

const router = Router();

// 发送验证码
router.post('/send-code', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: '请输入邮箱地址' });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: '邮箱格式不正确' });
    }

    await db.read();

    // 检查邮箱是否已注册
    const existingUser = db.data.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已注册' });
    }

    // 发送验证码
    const result = await sendVerificationCode(email);

    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(500).json({ error: result.message });
    }
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({ error: '发送验证码失败' });
  }
});

// 验证验证码
router.post('/verify-code', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: '请输入邮箱和验证码' });
    }

    const result = verifyCode(email, code);

    if (result.valid) {
      res.json({ valid: true, message: result.message });
    } else {
      res.status(400).json({ valid: false, error: result.message });
    }
  } catch (error) {
    console.error('验证验证码失败:', error);
    res.status(500).json({ error: '验证失败' });
  }
});

// 注册
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password, code } = req.body;

    if (!username || !email || !password || !code) {
      return res.status(400).json({ error: '请填写完整信息' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密码至少6位' });
    }

    // 验证验证码
    const codeResult = verifyCode(email, code);
    if (!codeResult.valid) {
      return res.status(400).json({ error: codeResult.message });
    }

    await db.read();

    // 检查邮箱是否已存在
    const existingUser = db.data.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已注册' });
    }

    // 检查用户名是否已存在
    const existingUsername = db.data.users.find(u => u.username === username);
    if (existingUsername) {
      return res.status(400).json({ error: '该用户名已被使用' });
    }

    // 创建用户
    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: uuidv4(),
      username,
      email,
      passwordHash,
      avatar: '',
      createdAt: new Date().toISOString(),
    };

    db.data.users.push(user);

    // 创建默认欢迎笔记
    const now = new Date().toISOString();
    const welcomeNote: Note = {
      id: uuidv4(),
      userId: user.id,
      title: '欢迎使用 Inkflow',
      content: JSON.stringify({
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: '欢迎使用 Inkflow' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Inkflow 是一款优雅的云端笔记应用，专注于纯粹的写作体验。' }] },
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '快速开始' }] },
          { type: 'bulletList', content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '点击左侧「新建笔记」创建新文档' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '输入 / 打开命令菜单，快速插入格式' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '使用 [[文档标题]] 创建双链引用' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '支持 Markdown 快捷输入' }] }] },
          ]},
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '快捷键' }] },
          { type: 'bulletList', content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ctrl/Cmd + N：新建笔记' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ctrl/Cmd + S：保存' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ctrl/Cmd + B：切换侧边栏' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ctrl/Cmd + /：查看所有快捷键' }] }] },
          ]},
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '功能特性' }] },
          { type: 'bulletList', content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '富文本编辑：标题、列表、代码块、图片等' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '笔记模板：日记、会议记录、待办清单等' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '双链引用：使用 [[标题]] 关联笔记' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '专注模式：全屏无干扰写作' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '深色模式：保护你的眼睛' }] }] },
          ]},
          { type: 'paragraph', content: [{ type: 'text', text: '开始你的写作之旅吧！' }] },
        ]
      }),
      icon: '👋',
      tags: ['入门指南'],
      isFavorite: true,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    db.data.notes.push(welcomeNote);

    await db.write();

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

// 登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '请填写邮箱和密码' });
    }

    await db.read();

    const user = db.data.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// 获取当前用户信息
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await db.read();

    const user = db.data.users.find(u => u.id === req.userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar || '',
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// 更新头像
router.put('/avatar', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({ error: '请提供头像数据' });
    }

    // 限制大小 (约 500KB 的 base64)
    if (avatar.length > 700000) {
      return res.status(400).json({ error: '头像图片太大，请压缩后重试' });
    }

    await db.read();

    const userIndex = db.data.users.findIndex(u => u.id === req.userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: '用户不存在' });
    }

    db.data.users[userIndex].avatar = avatar;
    await db.write();

    res.json({ avatar });
  } catch (error) {
    console.error('更新头像失败:', error);
    res.status(500).json({ error: '更新头像失败' });
  }
});

export default router;
