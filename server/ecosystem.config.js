module.exports = {
  apps: [{
    name: "inkflow",
    script: "dist/index.js",
    cwd: __dirname,
    env: {
      PORT: 3000,
      JWT_SECRET: "inkflow-secret",
      ADMIN_PASSWORD: "admin123",
      // QQ 邮箱 SMTP 配置（替换为你的信息）
      SMTP_HOST: "smtp.qq.com",
      SMTP_PORT: "465",
      SMTP_USER: "1063750098@qq.com",
      SMTP_PASS: "你的16位授权码"
    }
  }]
}
