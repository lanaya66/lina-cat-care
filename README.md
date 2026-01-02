# 🐱 Lina 吃喝拉撒记录系统

一个面向疾病期或特殊照护阶段猫咪的精细化照护记录工具，帮助照护者准确记录猫咪的吃、喝、排泄、用药与状态变化。

## ✨ 功能特点

- 📝 **时间线记录** - 按时间顺序记录所有照护事件
- 🍽️ **正在吃的** - 管理进行中的食物，支持跨天进食、多次加水/加食
- 📊 **今日统计** - 自动计算每日摄入量和排出量
- 📈 **趋势对比** - 7天/30天数据趋势可视化
- 🔄 **多设备同步** - 基于 Supabase 的云端数据同步
- 📱 **PWA 支持** - 可添加到主屏幕，像原生 App 一样使用

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Supabase

1. 访问 [supabase.com](https://supabase.com) 注册账号
2. 创建新项目
3. 在项目设置中找到 API 密钥
4. 复制 `.env.example` 为 `.env` 并填入配置：

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. 创建数据库表

在 Supabase SQL 编辑器中执行以下 SQL：

```sql
-- 时间线记录表
CREATE TABLE timeline_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  timestamp BIGINT NOT NULL,
  type TEXT NOT NULL,
  related_entity_id UUID,
  payload JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 食物卡片表
CREATE TABLE food_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  food_type TEXT NOT NULL,
  food_name TEXT,
  start_time BIGINT NOT NULL,
  initial_weight NUMERIC NOT NULL,
  initial_water_added NUMERIC NOT NULL,
  current_remaining NUMERIC NOT NULL,
  current_water_ratio NUMERIC NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_timeline_timestamp ON timeline_entries(user_id, timestamp DESC);
CREATE INDEX idx_foodcards_status ON food_cards(user_id, status);

-- 启用 RLS（行级安全）
ALTER TABLE timeline_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_cards ENABLE ROW LEVEL SECURITY;

-- 创建策略（用户只能访问自己的数据）
CREATE POLICY "用户可以查看自己的时间线记录"
  ON timeline_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以插入自己的时间线记录"
  ON timeline_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的时间线记录"
  ON timeline_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的时间线记录"
  ON timeline_entries FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以查看自己的食物卡片"
  ON food_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以插入自己的食物卡片"
  ON food_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的食物卡片"
  ON food_cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的食物卡片"
  ON food_cards FOR DELETE
  USING (auth.uid() = user_id);
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

### 5. 构建生产版本

```bash
npm run build
```

## 📱 使用方式

### 家庭共享建议

建议使用同一个账号登录（邮箱+密码），这样：
- 所有设备数据自动同步
- 爸爸妈妈都能看到最新记录
- 无需额外配置

### 添加到主屏幕（iOS）

1. 在 Safari 中打开网站
2. 点击底部分享按钮
3. 选择"添加到主屏幕"
4. 确认添加

### 添加到主屏幕（Android）

1. 在 Chrome 中打开网站
2. 点击右上角菜单
3. 选择"添加到主屏幕"
4. 确认添加

## 🏗️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: TailwindCSS
- **状态管理**: Zustand
- **图表**: Recharts
- **云端数据库**: Supabase
- **日期处理**: date-fns

## 📂 项目结构

```
src/
├── components/      # 可复用组件
│   ├── Layout.tsx
│   ├── MealPrepForm.tsx
│   ├── FoodCardItem.tsx
│   ├── FoodCardActions.tsx
│   ├── TimelineItem.tsx
│   └── AddRecordForm.tsx
├── pages/          # 页面
│   ├── AuthPage.tsx
│   ├── TimelinePage.tsx
│   ├── ActiveMealsPage.tsx
│   ├── DailyStatsPage.tsx
│   └── TrendsPage.tsx
├── stores/         # 状态管理
│   ├── useAuthStore.ts
│   ├── useTimelineStore.ts
│   └── useFoodCardStore.ts
├── utils/          # 工具函数
│   ├── calculations.ts
│   ├── statsCalculations.ts
│   ├── dateHelpers.ts
│   └── pwa.ts
├── types/          # TypeScript 类型
│   └── index.ts
├── lib/            # 第三方库配置
│   └── supabase.ts
└── styles/         # 样式
    └── index.css
```

## 🔒 隐私说明

- 所有数据存储在 Supabase 云端
- 每个用户只能访问自己的数据（RLS 保护）
- 不会收集任何额外的用户信息

## 📝 开发注意事项

### 性能优化

- 使用 `for` 循环代替 `forEach`、`map` 等高阶函数
- 计算密集型操作使用 `useMemo` 缓存

### 数据一致性

- 时间线是唯一真实数据源
- 所有统计都从时间线实时计算
- 修改时间线会自动触发统计更新

## 📄 许可证

本项目为私人项目，仅供家庭使用。

## 💝 关于

这个项目是为了更好地照护 Lina 而开发的。希望通过准确的数据记录，能为 Lina 的健康管理提供帮助。

---

祝 Lina 早日康复！🐾

