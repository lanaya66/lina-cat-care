# 修复数据库 RLS 策略

## 问题现象
- 添加备餐后，在"正在吃的"页面看不到新添加的食物卡片
- 时间线上也看不到备餐记录
- 可能看到控制台错误：`new row violates row-level security policy`

## 原因
Supabase 的 Row Level Security (RLS) 策略没有正确设置 INSERT 权限。

## 修复步骤

### 1. 登录 Supabase Dashboard
访问：https://supabase.com/dashboard

### 2. 进入你的项目

### 3. 打开 SQL Editor
在左侧菜单找到 **SQL Editor**

### 4. 执行以下 SQL 语句

```sql
-- ============================================
-- 食物卡片表 (food_cards) RLS 策略
-- ============================================

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "用户可以查看自己的食物卡片" ON food_cards;
DROP POLICY IF EXISTS "用户可以创建自己的食物卡片" ON food_cards;
DROP POLICY IF EXISTS "用户可以更新自己的食物卡片" ON food_cards;
DROP POLICY IF EXISTS "用户可以删除自己的食物卡片" ON food_cards;

-- 启用 RLS
ALTER TABLE food_cards ENABLE ROW LEVEL SECURITY;

-- 创建新策略
CREATE POLICY "用户可以查看自己的食物卡片"
ON food_cards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的食物卡片"
ON food_cards FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的食物卡片"
ON food_cards FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的食物卡片"
ON food_cards FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 时间线表 (timeline_entries) RLS 策略
-- ============================================

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "用户可以查看自己的时间线" ON timeline_entries;
DROP POLICY IF EXISTS "用户可以创建自己的时间线记录" ON timeline_entries;
DROP POLICY IF EXISTS "用户可以更新自己的时间线记录" ON timeline_entries;
DROP POLICY IF EXISTS "用户可以删除自己的时间线记录" ON timeline_entries;

-- 启用 RLS
ALTER TABLE timeline_entries ENABLE ROW LEVEL SECURITY;

-- 创建新策略
CREATE POLICY "用户可以查看自己的时间线"
ON timeline_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的时间线记录"
ON timeline_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的时间线记录"
ON timeline_entries FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的时间线记录"
ON timeline_entries FOR DELETE
USING (auth.uid() = user_id);
```

### 5. 点击 **Run** 按钮执行

### 6. 检查是否成功
- 如果成功，会显示 `Success. No rows returned`
- 如果有错误，复制错误信息给我

### 7. 测试
- 回到应用，刷新页面
- 尝试添加一个新的备餐
- 现在应该能够在"正在吃的"页面看到新添加的食物卡片了

## 验证策略是否生效

在 SQL Editor 中运行以下查询，查看当前的 RLS 策略：

```sql
-- 查看 food_cards 表的策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'food_cards';

-- 查看 timeline_entries 表的策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'timeline_entries';
```

应该看到每个表有 4 条策略（SELECT, INSERT, UPDATE, DELETE）。

## 如果问题仍然存在

1. 检查控制台错误信息
2. 确认已经登录（有有效的 session）
3. 检查 `.env` 文件中的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 是否正确
4. 重启开发服务器：`npm run dev`

