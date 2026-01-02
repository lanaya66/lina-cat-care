/**
 * 主应用组件
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/useAuthStore';
import { isSupabaseConfigured } from './lib/supabase';
import ConfigWarningPage from './pages/ConfigWarningPage';
import AuthPage from './pages/AuthPage';
import Layout from './components/Layout';
import TimelinePage from './pages/TimelinePage';
import ActiveMealsPage from './pages/ActiveMealsPage';
import DailyStatsPage from './pages/DailyStatsPage';
import TrendsPage from './pages/TrendsPage';

function App() {
  const { userId, loading, initialize } = useAuthStore();

  // 检查 Supabase 是否已配置
  if (!isSupabaseConfigured()) {
    return <ConfigWarningPage />;
  }

  // 初始化认证状态
  useEffect(() => {
    const cleanup = initialize();
    return cleanup;
  }, [initialize]);

  // 加载中状态
  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录，显示认证页面
  if (!userId) {
    return <AuthPage />;
  }

  // 已登录，显示主应用
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/timeline" replace />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="active-meals" element={<ActiveMealsPage />} />
          <Route path="daily-stats" element={<DailyStatsPage />} />
          <Route path="trends" element={<TrendsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

