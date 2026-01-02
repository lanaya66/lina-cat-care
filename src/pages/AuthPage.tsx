/**
 * 认证页面（登录/注册）
 */

import { useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

export default function AuthPage() {
  const { signIn, signUp, error } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 处理提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    setLoading(false);

    if (!success) {
      // 错误已经在 store 中设置
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo 区域 */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-5xl">🐱</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Lina 照护记录
          </h1>
          <p className="text-gray-600">记录每一天的爱与陪伴</p>
        </div>

        {/* 表单卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex mb-6">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 text-center font-medium transition-colors ${
                !isSignUp
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-400'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 text-center font-medium transition-colors ${
                isSignUp
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-400'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 邮箱输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="your@email.com"
                required
              />
            </div>

            {/* 密码输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="至少 6 位"
                minLength={6}
                required
              />
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-lg"
            >
              {loading ? '处理中...' : isSignUp ? '注册' : '登录'}
            </button>
          </form>

          {/* 提示信息 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>家庭共享提示：</strong>
              <br />
              建议使用同一个账号登录，数据自动同步到所有设备。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

