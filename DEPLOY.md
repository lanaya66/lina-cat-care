# 部署指南

本文档说明如何将 Lina 吃喝拉撒记录应用部署到 Vercel。

## 前提条件

1. 已完成 Supabase 数据库配置（参见 `SETUP.md`）
2. 已在本地测试应用运行正常
3. 拥有 GitHub 账号
4. 拥有 Vercel 账号（可以用 GitHub 登录）

## 部署步骤

### 1. 准备代码仓库

#### 1.1 初始化 Git 仓库（如果还没有）

```bash
git init
git add .
git commit -m "Initial commit"
```

#### 1.2 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 创建一个新的仓库（可以设置为私有）
3. 按照提示将本地代码推送到 GitHub：

```bash
git remote add origin https://github.com/你的用户名/你的仓库名.git
git branch -M main
git push -u origin main
```

### 2. 部署到 Vercel

#### 2.1 登录 Vercel

1. 访问 https://vercel.com
2. 使用 GitHub 账号登录

#### 2.2 导入项目

1. 点击 "Add New..." → "Project"
2. 选择你刚才创建的 GitHub 仓库
3. 点击 "Import"

#### 2.3 配置环境变量

在 "Configure Project" 页面：

1. 展开 "Environment Variables" 部分
2. 添加以下环境变量：

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | 你的 Supabase 项目 URL |
| `VITE_SUPABASE_ANON_KEY` | 你的 Supabase anon public key |

> **在哪里找到这些值？**
> - 登录 Supabase Dashboard
> - 进入你的项目
> - 左侧菜单 → Settings → API
> - `VITE_SUPABASE_URL` = Project URL
> - `VITE_SUPABASE_ANON_KEY` = anon public key

#### 2.4 开始部署

1. 确认配置无误
2. 点击 "Deploy" 按钮
3. 等待部署完成（通常需要 2-5 分钟）

#### 2.5 访问应用

部署成功后，Vercel 会提供一个 URL，格式类似：
```
https://你的项目名.vercel.app
```

点击访问，测试应用是否正常运行。

### 3. 配置自定义域名（可选）

如果你有自己的域名：

1. 在 Vercel 项目页面，点击 "Settings"
2. 选择 "Domains"
3. 添加你的域名
4. 按照提示在你的域名注册商处配置 DNS 记录

### 4. 自动部署

每次你将代码推送到 GitHub 的 `main` 分支，Vercel 会自动重新部署：

```bash
git add .
git commit -m "更新说明"
git push
```

## 移动端访问

### 添加到主屏幕（iOS）

1. 在 Safari 中打开应用
2. 点击底部的分享按钮
3. 选择"添加到主屏幕"
4. 点击"添加"

### 添加到主屏幕（Android）

1. 在 Chrome 中打开应用
2. 点击右上角菜单（三个点）
3. 选择"添加到主屏幕"
4. 点击"添加"

添加后，应用图标会出现在手机主屏幕上，可以像原生应用一样使用。

## 共享给家人

将 Vercel 提供的 URL 分享给家人：

1. 每个人都需要注册自己的账号
2. 每个人只能看到自己记录的数据（RLS 保护）
3. 如果需要共享数据，可以考虑：
   - 使用同一个账号登录（不推荐，会混淆数据）
   - 或者在未来版本中添加家庭共享功能

## 更新应用

当你需要更新应用时：

1. 在本地修改代码
2. 测试确认无误
3. 提交并推送到 GitHub：

```bash
git add .
git commit -m "功能更新：xxx"
git push
```

4. Vercel 会自动部署新版本
5. 家人访问时会自动获取最新版本

## 监控和日志

在 Vercel Dashboard 中可以查看：

- 部署历史
- 访问日志
- 错误报告
- 性能指标

## 成本

- **Vercel**: 免费版足够个人和家庭使用
  - 每月 100GB 带宽
  - 无限部署次数
  
- **Supabase**: 免费版足够使用
  - 500MB 数据库存储
  - 50,000 月活跃用户
  - 5GB 文件存储
  - 2GB 数据传输

## 故障排查

### 部署失败

- 检查环境变量是否正确配置
- 查看 Vercel 的构建日志
- 确认代码在本地能正常运行

### 无法访问

- 检查 Supabase 项目是否暂停（长时间不用会自动暂停）
- 在 Supabase Dashboard 中恢复项目

### 数据显示不正确

- 确认已执行 `MIGRATION.sql` 数据库迁移
- 检查 RLS 策略是否正确配置（参见 `RLS_POLICY_FIX.md`）

## 备份数据

定期备份 Supabase 数据库：

1. 登录 Supabase Dashboard
2. 进入你的项目
3. 左侧菜单 → Database → Backups
4. 点击 "Create backup"

免费版会自动保留最近 7 天的备份。

## 联系支持

如果遇到问题：

- Vercel 支持：https://vercel.com/support
- Supabase 支持：https://supabase.com/support
- GitHub Issues（如果是应用本身的问题）

## 安全建议

1. **不要**将 `.env` 文件提交到 Git
2. **不要**分享你的 Supabase API keys
3. **定期**更改密码
4. **启用**Supabase 的邮箱验证（已在设置中禁用，上线后建议启用）

## 下一步

- 考虑启用 Supabase 的邮箱验证功能
- 设置数据自动备份
- 监控应用使用情况
- 根据实际使用情况优化功能

祝使用愉快！🐱

