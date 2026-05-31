import { useState } from 'react';
import { X, Download, Smartphone, Globe, Github, HardDrive } from 'lucide-react';

interface InstallGuideProps {
  onClose: () => void;
}

export default function InstallGuide({ onClose }: InstallGuideProps) {
  const [activeTab, setActiveTab] = useState<'install' | 'deploy' | 'guide'>('install');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-page-bg border border-border rounded-2xl shadow-2xl w-full max-w-[700px] mx-4 animate-slide-up overflow-hidden max-h-[85vh] flex flex-col">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Download size={20} className="text-accent" />
            <h2 className="text-lg font-semibold text-text-primary">安装与使用</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-secondary rounded-lg transition-colors duration-150"
          >
            <X size={18} />
          </button>
        </div>

        {/* 标签页 */}
        <div className="px-6 pt-4 flex gap-4 border-b border-border">
          <button
            onClick={() => setActiveTab('install')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors duration-150 ${
              activeTab === 'install'
                ? 'text-accent border-accent'
                : 'text-text-muted border-transparent hover:text-text-secondary'
            }`}
          >
            安装应用
          </button>
          <button
            onClick={() => setActiveTab('deploy')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors duration-150 ${
              activeTab === 'deploy'
                ? 'text-accent border-accent'
                : 'text-text-muted border-transparent hover:text-text-secondary'
            }`}
          >
            自建部署
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors duration-150 ${
              activeTab === 'guide'
                ? 'text-accent border-accent'
                : 'text-text-muted border-transparent hover:text-text-secondary'
            }`}
          >
            使用指南
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'install' && (
            <div className="space-y-6">
              {/* 浏览器安装 */}
              <div className="p-4 rounded-xl border border-border bg-hover-bg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center">
                    <Globe size={20} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">浏览器安装（推荐）</h3>
                    <p className="text-xs text-text-muted">安装到桌面，像原生应用一样使用</p>
                  </div>
                </div>
                <div className="space-y-3 ml-13">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="text-sm text-text-secondary">使用 Chrome / Edge / Safari 打开本应用</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="text-sm text-text-secondary">点击浏览器地址栏右侧的 <strong>安装图标</strong></p>
                      <p className="text-xs text-text-muted mt-1">Chrome/Edge: 地址栏右侧的 ⊕ 或 💻 图标</p>
                      <p className="text-xs text-text-muted">Safari: 分享按钮 → 添加到程序坞</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                    <div>
                      <p className="text-sm text-text-secondary">点击"安装"即可</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 手机安装 */}
              <div className="p-4 rounded-xl border border-border bg-hover-bg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center">
                    <Smartphone size={20} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">手机安装</h3>
                    <p className="text-xs text-text-muted">添加到手机主屏幕</p>
                  </div>
                </div>
                <div className="space-y-3 ml-13">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="text-sm text-text-secondary">用手机浏览器打开本应用</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="text-sm text-text-secondary">点击分享按钮</p>
                      <p className="text-xs text-text-muted mt-1">iOS Safari: 底部分享图标</p>
                      <p className="text-xs text-text-muted">Android Chrome: 右上角菜单</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                    <div>
                      <p className="text-sm text-text-secondary">选择"添加到主屏幕"</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 数据说明 */}
              <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                <div className="flex items-start gap-3">
                  <HardDrive size={20} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">数据存储说明</h3>
                    <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                      <li>• 数据保存在浏览器本地（IndexedDB）</li>
                      <li>• 关闭浏览器或重启电脑不会丢失数据</li>
                      <li>• <strong>清空浏览器缓存会丢失所有数据</strong></li>
                      <li>• 换浏览器或换电脑无法同步数据</li>
                      <li>• 建议定期使用"导出备份"功能保存数据</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="space-y-6">
              <p className="text-sm text-text-secondary">
                如果你想自己部署一个 Inkflow 实例，可以选择以下方式：
              </p>

              {/* Vercel */}
              <div className="p-4 rounded-xl border border-border">
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-black text-white text-xs flex items-center justify-center">V</span>
                  Vercel（推荐）
                </h3>
                <div className="bg-code-bg rounded-lg p-3 text-sm font-mono text-text-secondary">
                  <p className="text-text-muted"># 1. 克隆仓库</p>
                  <p>git clone https://github.com/JayLinton/Inkflow.git</p>
                  <p className="text-text-muted mt-2"># 2. 安装依赖</p>
                  <p>cd Inkflow && npm install --legacy-peer-deps</p>
                  <p className="text-text-muted mt-2"># 3. 部署</p>
                  <p>npm i -g vercel && vercel --prod</p>
                </div>
              </div>

              {/* Netlify */}
              <div className="p-4 rounded-xl border border-border">
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-teal-500 text-white text-xs flex items-center justify-center">N</span>
                  Netlify
                </h3>
                <div className="bg-code-bg rounded-lg p-3 text-sm font-mono text-text-secondary">
                  <p className="text-text-muted"># 构建</p>
                  <p>npm run build</p>
                  <p className="text-text-muted mt-2"># 拖拽 dist 文件夹到 netlify.com/drop</p>
                </div>
              </div>

              {/* Docker */}
              <div className="p-4 rounded-xl border border-border">
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-blue-500 text-white text-xs flex items-center justify-center">D</span>
                  Docker
                </h3>
                <div className="bg-code-bg rounded-lg p-3 text-sm font-mono text-text-secondary">
                  <p className="text-text-muted"># 构建镜像</p>
                  <p>docker build -t inkflow .</p>
                  <p className="text-text-muted mt-2"># 运行</p>
                  <p>docker run -p 3000:80 inkflow</p>
                </div>
              </div>

              {/* GitHub */}
              <div className="p-4 rounded-xl border border-border">
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <Github size={20} />
                  GitHub Pages
                </h3>
                <p className="text-sm text-text-secondary">
                  推送代码到 GitHub 后，在仓库 Settings → Pages 中启用即可自动部署。
                </p>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-text-primary">快速开始</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-accent">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">创建笔记</p>
                      <p className="text-xs text-text-muted">点击左侧"新建笔记"按钮，或按 Ctrl/Cmd + N</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-accent">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">使用模板</p>
                      <p className="text-xs text-text-muted">创建笔记时可选择预设模板，快速开始写作</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-accent">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">自动保存</p>
                      <p className="text-xs text-text-muted">所有修改自动保存到浏览器本地，无需手动保存</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-semibold text-text-primary">常用快捷键</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-hover-bg rounded text-xs">Ctrl/Cmd + N</kbd>
                    <span className="text-text-secondary">新建笔记</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-hover-bg rounded text-xs">Ctrl/Cmd + S</kbd>
                    <span className="text-text-secondary">手动保存</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-hover-bg rounded text-xs">Ctrl/Cmd + B</kbd>
                    <span className="text-text-secondary">切换侧边栏</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-hover-bg rounded text-xs">/</kbd>
                    <span className="text-text-secondary">命令菜单</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-hover-bg rounded text-xs">[[</kbd>
                    <span className="text-text-secondary">插入双链</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-hover-bg rounded text-xs">Ctrl/Cmd + /</kbd>
                    <span className="text-text-secondary">快捷键帮助</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-semibold text-text-primary">数据备份</h3>
                <p className="text-sm text-text-secondary">
                  定期导出备份非常重要！点击设置菜单 → 数据统计 → 导出备份，保存为 JSON 文件。
                  需要恢复时，使用导入功能即可。
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-semibold text-text-primary">更多帮助</h3>
                <a
                  href="https://github.com/JayLinton/Inkflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
                >
                  <Github size={16} />
                  查看 GitHub 仓库
                </a>
              </div>
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-text-secondary bg-hover-bg hover:bg-active-bg rounded-lg transition-colors duration-150"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
