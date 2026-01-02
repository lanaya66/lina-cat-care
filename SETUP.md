# 🛠️ Supabase 配置详细教程

## 步骤 1: 创建 Supabase 账号

1. 访问 https://supabase.com
2. 点击 "Start your project"
3. 使用 GitHub 或邮箱注册

## 步骤 2: 创建新项目

1. 登录后点击 "New Project"
2. 填写项目信息：
   - Name: `lina-care-record`（或你喜欢的名字）
   - Database Password: 设置一个强密码（保存好）
   - Region: 选择离你最近的区域（建议选择 Singapore 或 Tokyo）
3. 点击 "Create new project"
4. 等待 1-2 分钟，项目初始化完成

## 步骤 3: 获取 API 密钥

1. 在项目页面，点击左侧菜单的 ⚙️ "Project Settings"
2. 点击 "API" 标签
3. 找到以下两个值：
   - **Project URL**: 类似 `https://xxxxx.supabase.co`
   - **anon public key**: 一串很长的字符串

## 步骤 4: 配置环境变量

1. 在项目根目录创建 `.env` 文件
2. 复制以下内容并填入你的值：

```env
VITE_SUPABASE_URL=你的_Project_URL
VITE_SUPABASE_ANON_KEY=你的_anon_public_key
```

示例：
```env
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 步骤 5: 创建数据库表

1. 在 Supabase 项目页面，点击左侧的 🗄️ "SQL Editor"
2. 点击 "+ New query"
3. 复制以下完整 SQL 代码并粘贴：

```sql
-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建时间线记录表
CREATE TABLE timeline_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  timestamp BIGINT NOT NULL,
  type TEXT NOT NULL,
  related_entity_id UUID,
  payload JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建食物卡片表
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

-- 创建索引以提升查询性能
CREATE INDEX idx_timeline_timestamp ON timeline_entries(user_id, timestamp DESC);
CREATE INDEX idx_timeline_type ON timeline_entries(user_id, type);
CREATE INDEX idx_foodcards_status ON food_cards(user_id, status);
CREATE INDEX idx_foodcards_starttime ON food_cards(user_id, start_time DESC);

-- 启用行级安全 (RLS)
ALTER TABLE timeline_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_cards ENABLE ROW LEVEL SECURITY;

-- timeline_entries 表的安全策略
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

-- food_cards 表的安全策略
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

4. 点击右下角 "Run" 按钮执行
5. 看到 "Success. No rows returned" 表示成功

## 步骤 6: 启用邮箱认证

1. 点击左侧 🔐 "Authentication"
2. 点击 "Providers" 标签
3. 找到 "Email"，确保已启用
4. （可选）关闭 "Confirm email" 以简化注册流程

## 步骤 7: 测试配置

1. 运行 `npm run dev`
2. 打开 http://localhost:3000
3. 尝试注册一个测试账号
4. 如果能成功注册并进入主界面，说明配置成功！

## 常见问题

### Q: 提示 "Invalid API key"
A: 检查 `.env` 文件中的 `VITE_SUPABASE_ANON_KEY` 是否正确复制

### Q: 提示 "relation does not exist"
A: 说明数据库表未创建成功，重新执行步骤 5 的 SQL

### Q: 注册后提示 "Confirm your email"
A: 到 Supabase Authentication → Providers → Email 关闭 "Confirm email"

### Q: 无法在国内访问 Supabase
A: Supabase 在国内可以访问，如遇问题可尝试：
   - 切换网络（移动数据/WiFi）
   - 使用科学上网工具
   - 联系 Supabase 技术支持

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 访问 https://vercel.com
3. 点击 "Import Project"
4. 选择你的 GitHub 仓库
5. 在环境变量中添加：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. 点击 "Deploy"
7. 等待几分钟，获得访问链接

完成后，就可以在手机浏览器打开链接，并添加到主屏幕使用了！

---

如有问题，可以查看 Supabase 官方文档：https://supabase.com/docs

