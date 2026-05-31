import nodemailer from 'nodemailer';

// 邮件配置
// 使用 QQ 邮箱 SMTP（免费）
// 需要在 QQ 邮箱设置中开启 SMTP 服务，获取授权码
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.qq.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '', // 你的邮箱
    pass: process.env.SMTP_PASS || '', // 授权码（不是密码）
  },
};

// 创建邮件传输器
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// 验证码存储（内存，5分钟过期）
const verificationCodes = new Map<string, { code: string; expires: number }>();

// 生成6位随机验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 发送验证码
export async function sendVerificationCode(email: string): Promise<{ success: boolean; message: string }> {
  // 检查邮件配置
  if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
    console.error('邮件未配置，请在 .env 文件中设置 SMTP_USER 和 SMTP_PASS');
    return { success: false, message: '邮件服务未配置' };
  }

  // 生成验证码
  const code = generateCode();
  const expires = Date.now() + 5 * 60 * 1000; // 5分钟过期

  // 存储验证码
  verificationCodes.set(email, { code, expires });

  // 邮件内容
  const mailOptions = {
    from: `"Inkflow" <${EMAIL_CONFIG.auth.user}>`,
    to: email,
    subject: 'Inkflow 邮箱验证码',
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #333;">Inkflow 邮箱验证</h2>
        </div>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center;">
          <p style="color: #666; margin-bottom: 10px;">您的验证码是：</p>
          <h1 style="color: #333; font-size: 32px; letter-spacing: 8px; margin: 0;">${code}</h1>
          <p style="color: #999; font-size: 12px; margin-top: 15px;">验证码 5 分钟内有效，请勿泄露给他人</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>如非本人操作，请忽略此邮件</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: '验证码已发送' };
  } catch (error) {
    console.error('发送邮件失败:', error);
    verificationCodes.delete(email);
    return { success: false, message: '发送验证码失败，请稍后重试' };
  }
}

// 验证验证码
export function verifyCode(email: string, code: string): { valid: boolean; message: string } {
  const stored = verificationCodes.get(email);

  if (!stored) {
    return { valid: false, message: '请先获取验证码' };
  }

  if (Date.now() > stored.expires) {
    verificationCodes.delete(email);
    return { valid: false, message: '验证码已过期，请重新获取' };
  }

  if (stored.code !== code) {
    return { valid: false, message: '验证码错误' };
  }

  // 验证成功，删除验证码
  verificationCodes.delete(email);
  return { valid: true, message: '验证成功' };
}

// 清理过期验证码（定期清理）
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of verificationCodes.entries()) {
    if (now > data.expires) {
      verificationCodes.delete(email);
    }
  }
}, 60 * 1000); // 每分钟清理一次
