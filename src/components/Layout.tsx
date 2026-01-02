/**
 * 主布局组件（带底部导航栏）
 */

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Clock, UtensilsCrossed, BarChart3, TrendingUp } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  // 导航项配置
  const navItems = [
    { path: '/timeline', icon: Clock, label: '时间线' },
    { path: '/active-meals', icon: UtensilsCrossed, label: '正在吃的' },
    { path: '/daily-stats', icon: BarChart3, label: '今日统计' },
    { path: '/trends', icon: TrendingUp, label: '趋势对比' },
  ];

  return (
    <div className="page-container">
      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>

      {/* 底部导航栏 */}
      <nav className="bottom-nav safe-area-inset-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

