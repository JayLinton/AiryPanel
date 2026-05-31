import nodemailer from 'nodemailer';

// SMTP 配置（支持 QQ 邮箱 / 163 邮箱 / Gmail）
// 在 .env 中配置:
// SMTP_HOST=smtp.qq.com
// SMTP_PORT=465
// SMTP_USER=你的邮箱@qq.com
// SMTP_PASS=你的授权码（不是登录密码）
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.qq.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

if (!SMTP_USER || !SMTP_PASS) {
  console.error('❌ 错误: 未配置 SMTP_USER 或 SMTP_PASS 环境变量');
  console.error('QQ 邮箱请参考: https://service.mail.qq.com/cgi-bin/help?subtype=1&&id=28&&no=167');
}

// 创建 SMTP 传输器
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // 465 端口使用 SSL
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

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
    console.log(`📧 使用 SMTP: ${SMTP_USER || '未配置'}`);

    const mailOptions = {
      from: `"Inkflow" <${SMTP_USER}>`,
      to: email,
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
                <table width="400" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); border: 1px solid #e5e5e5;">
                  <!-- Logo -->
                  <tr>
                    <td style="padding: 48px 40px 32px; text-align: center;">
                      <div style="width: 48px; height: 48px; background: #171717; border-radius: 12px; margin: 0 auto 20px;">
                        <svg width="48" height="48" viewBox="0 0 48 46" fill="none">
                          <path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="white"/>
                        </svg>
                      </div>
                      <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #1a1a1a; letter-spacing: -0.02em;">邮箱验证</h1>
                    </td>
                  </tr>

                  <!-- 验证码 -->
                  <tr>
                    <td style="padding: 0 40px 40px;">
                      <div style="background: #fafafa; border-radius: 12px; padding: 32px; text-align: center; border: 1px solid #e5e5e5;">
                        <p style="margin: 0 0 20px; font-size: 13px; color: #737373; letter-spacing: 0.05em;">验证码</p>
                        <div style="font-size: 36px; font-weight: 700; color: #171717; letter-spacing: 0.3em; font-family: 'SF Mono', 'Fira Code', monospace;">${code}</div>
                        <p style="margin: 20px 0 0; font-size: 12px; color: #a3a3a3;">5 分钟内有效</p>
                      </div>
                    </td>
                  </tr>

                  <!-- 提示 -->
                  <tr>
                    <td style="padding: 0 40px 40px;">
                      <p style="margin: 0; font-size: 13px; color: #a3a3a3; text-align: center; line-height: 1.6;">
                        如非本人操作，请忽略此邮件
                      </p>
                    </td>
                  </tr>

                  <!-- 底部 -->
                  <tr>
                    <td style="padding: 20px 40px; border-top: 1px solid #e5e5e5;">
                      <p style="margin: 0; font-size: 12px; color: #a3a3a3; text-align: center;">
                        © ${new Date().getFullYear()} Inkflow
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
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ 邮件发送成功, Message ID:', info.messageId);
    return { success: true, message: '验证码已发送' };
  } catch (error: any) {
    console.error('❌ 发送邮件失败:', error.message || error);
    console.error('❌ 错误代码:', error.code);
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
