import { Resend } from 'resend';

// Resend 配置
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'Inkflow <onboarding@resend.dev>';

// 创建 Resend 实例
const resend = new Resend(RESEND_API_KEY);

// 验证码存储（内存，5分钟过期）
const verificationCodes = new Map<string, { code: string; expires: number }>();

// 生成6位随机验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 发送验证码
export async function sendVerificationCode(email: string): Promise<{ success: boolean; message: string }> {
  // 检查配置
  if (!RESEND_API_KEY) {
    console.error('Resend API Key 未配置，请在 .env 文件中设置 RESEND_API_KEY');
    return { success: false, message: '邮件服务未配置' };
  }

  // 生成验证码
  const code = generateCode();
  const expires = Date.now() + 5 * 60 * 1000; // 5分钟过期

  // 存储验证码
  verificationCodes.set(email, { code, expires });

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Inkflow 邮箱验证码',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 48px; height: 48px; background: #171717; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <svg width="24" height="24" viewBox="0 0 48 46" fill="none">
                <path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="white"/>
              </svg>
            </div>
            <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 0;">邮箱验证</h2>
          </div>
          <div style="background: #f5f5f5; border-radius: 12px; padding: 24px; text-align: center;">
            <p style="color: #666; font-size: 14px; margin: 0 0 12px;">您的验证码是：</p>
            <h1 style="color: #1a1a1a; font-size: 36px; font-weight: 700; letter-spacing: 8px; margin: 0; font-family: monospace;">${code}</h1>
            <p style="color: #999; font-size: 12px; margin: 16px 0 0;">验证码 5 分钟内有效，请勿泄露给他人</p>
          </div>
          <div style="text-align: center; margin-top: 24px; color: #999; font-size: 12px;">
            <p>如非本人操作，请忽略此邮件</p>
          </div>
        </div>
      `,
    });

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
