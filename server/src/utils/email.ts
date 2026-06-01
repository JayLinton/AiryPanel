import { Resend } from 'resend';

// Resend 配置
// 在 .env 中配置: RESEND_API_KEY=re_xxxxxxxxxxxx
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error('❌ 错误: 未配置 RESEND_API_KEY 环境变量');
  console.error('请访问 https://resend.com 获取 API Key');
}

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
  // 生成验证码
  const code = generateCode();
  const expires = Date.now() + 5 * 60 * 1000; // 5分钟过期

  // 存储验证码
  verificationCodes.set(email, { code, expires });

  try {
    console.log(`📧 尝试发送验证码到: ${email}`);
    console.log(`📧 使用 Resend API`);

    const { data, error } = await resend.emails.send({
      from: 'Inkflow <noreply@inkflow.7rees.xyz>',
      to: [email],
      subject: 'Inkflow 验证码',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; padding: 48px 24px;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid #e5e5e5;">
                  <!-- 横向布局：Logo + 验证码 -->
                  <tr>
                    <td style="padding: 40px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <!-- 左侧：Logo + 标题 -->
                          <td width="160" valign="middle" style="padding-right: 32px; border-right: 1px solid #e5e5e5;">
                            <table cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                              <tr>
                                <td style="width: 48px; height: 48px; background: #171717; border-radius: 12px; text-align: center; vertical-align: middle;">
                                  <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                    <tr><td style="width: 24px; height: 5px; background: #ffffff; border-radius: 2px;"></td></tr>
                                    <tr><td style="height: 4px;"></td></tr>
                                    <tr><td style="width: 24px; height: 5px; background: #ffffff; border-radius: 2px;"></td></tr>
                                    <tr><td style="height: 4px;"></td></tr>
                                    <tr><td style="width: 24px; height: 5px; background: #ffffff; border-radius: 2px;"></td></tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                            <h1 style="margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a; letter-spacing: -0.02em;">邮箱验证</h1>
                            <p style="margin: 8px 0 0; font-size: 13px; color: #a3a3a3;">5 分钟内有效</p>
                          </td>

                          <!-- 右侧：验证码 -->
                          <td valign="middle" style="padding-left: 32px; text-align: center;">
                            <p style="margin: 0 0 12px; font-size: 13px; color: #737373; letter-spacing: 0.05em;">验证码</p>
                            <div style="font-size: 40px; font-weight: 700; color: #171717; letter-spacing: 0.2em; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${code}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- 底部 -->
                  <tr>
                    <td style="padding: 16px 40px; border-top: 1px solid #e5e5e5;">
                      <p style="margin: 0; font-size: 12px; color: #a3a3a3; text-align: center;">
                        如非本人操作，请忽略此邮件 · © ${new Date().getFullYear()} Inkflow
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Resend 发送失败:', error);
      verificationCodes.delete(email);
      return { success: false, message: '发送验证码失败，请稍后重试' };
    }

    console.log('✅ 邮件发送成功, ID:', data?.id);
    return { success: true, message: '验证码已发送' };
  } catch (error: any) {
    console.error('❌ 发送邮件失败:', error.message || error);
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
