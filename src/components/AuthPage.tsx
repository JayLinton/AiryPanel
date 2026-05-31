import { useState } from 'react';
import { authAPI, setToken, type User } from '@/api/client';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await authAPI.login(email, password);
      } else {
        if (!username.trim()) {
          setError('请输入用户名');
          setLoading(false);
          return;
        }
        response = await authAPI.register(username, email, password);
      }

      setToken(response.token);
      onLogin(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--page-bg)' }}>
      <div className="w-full max-w-[400px] mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent flex items-center justify-center shadow-lg">
            <svg width="36" height="36" viewBox="0 0 48 46" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="white"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Inkflow</h1>
          <p className="text-sm text-text-muted mt-1">优雅的云端笔记应用</p>
        </div>

        {/* 表单卡片 */}
        <div className="bg-page-bg border border-border rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">
            {isLogin ? '登录' : '注册'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 用户名（仅注册） */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  用户名
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="输入用户名"
                  className="w-full px-4 py-2.5 text-sm border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent-ring transition-all"
                  style={{ backgroundColor: 'var(--hover-bg)' }}
                />
              </div>
            )}

            {/* 邮箱 */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="输入邮箱地址"
                required
                className="w-full px-4 py-2.5 text-sm border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent-ring transition-all"
                style={{ backgroundColor: 'var(--hover-bg)' }}
              />
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? '输入密码' : '至少6位密码'}
                required
                minLength={6}
                className="w-full px-4 py-2.5 text-sm border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent-ring transition-all"
                style={{ backgroundColor: 'var(--hover-bg)' }}
              />
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2.5 rounded-lg">
                {error}
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '请稍候...' : (isLogin ? '登录' : '注册')}
            </button>
          </form>

          {/* 切换登录/注册 */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm text-text-muted hover:text-accent transition-colors"
            >
              {isLogin ? '没有账号？点击注册' : '已有账号？点击登录'}
            </button>
          </div>
        </div>

        {/* 底部 */}
        <p className="text-xs text-text-muted text-center mt-6">
          数据安全存储在云端，登录后即可使用
        </p>
      </div>
    </div>
  );
}
