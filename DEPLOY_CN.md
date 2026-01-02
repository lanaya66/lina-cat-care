# 国内部署指南（Vercel + Cloudflare）

针对中国国内访问优化的部署方案。

## 准备工作

需要的账号：
- [x] GitHub 账号
- [ ] Vercel 账号（用 GitHub 登录即可）
- [ ] Cloudflare 账号（免费）
- [ ] 一个已有的域名（可以使用子域名）

## 第一步：将代码推送到 GitHub

### 1.1 初始化 Git 仓库

```bash
cd "/Users/lanaya/Documents/工作/vibe coding/Lina 吃喝拉撒记录"
git init
git add .
git commit -m "Initial commit: Lina 猫咪记录系统"
```

### 1.2 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 仓库名称：`lina-cat-care`（或其他你喜欢的名字）
3. 选择 **Private**（私有仓库，保护数据）
4. **不要**勾选 "Add a README file"
5. 点击 "Create repository"

### 1.3 推送到 GitHub

GitHub 创建成功后会显示命令，复制执行：

```bash
git remote add origin https://github.com/你的用户名/lina-cat-care.git
git branch -M main
git push -u origin main
```

✅ **完成后确认**：在 GitHub 页面刷新，应该能看到所有代码文件。

---

## 第二步：部署到 Vercel

### 2.1 登录 Vercel

1. 访问 https://vercel.com
2. 点击右上角 "Sign Up"
3. 选择 "Continue with GitHub"
4. 授权 Vercel 访问你的 GitHub

### 2.2 导入项目

1. 在 Vercel Dashboard 点击 "Add New..." → "Project"
2. 找到 `lina-cat-care` 仓库
3. 点击 "Import"

### 2.3 配置项目

在 "Configure Project" 页面：

#### 项目名称
- Project Name: `lina-cat-care`（可以自定义）

#### 环境变量（重要！）

点击 "Environment Variables"，添加：

| Name | Value | 从哪里获取 |
|------|-------|-----------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbG...` | Supabase Dashboard → Settings → API → anon public |

> **提示**：打开你的 `.env` 文件，直接复制这两个值

#### 其他设置
- Framework Preset: **Vite** （应该自动识别）
- Root Directory: `./` （默认）
- Build Command: `npm run build` （默认）
- Output Directory: `dist` （默认）

### 2.4 开始部署

1. 确认所有配置无误
2. 点击 **"Deploy"** 按钮
3. 等待 2-5 分钟
4. 看到 "🎉 Congratulations" 表示成功

### 2.5 测试 Vercel 域名

部署成功后会得到一个域名，如：
```
https://lina-cat-care.vercel.app
```

点击访问，测试：
- [ ] 页面能正常打开
- [ ] 能注册/登录
- [ ] 能添加记录

✅ **如果测试通过，说明应用本身没问题，可以进行下一步。**

---

## 第三步：配置 Cloudflare + 自定义域名

### 3.1 准备子域名

决定你要使用的子域名，例如：
- `lina.你的域名.com`
- `cat.你的域名.com`
- `record.你的域名.com`

### 3.2 域名托管到 Cloudflare（如果还没有）

#### 如果你的域名还在阿里云/腾讯云等

1. 登录 https://dash.cloudflare.com/
2. 点击 "添加站点" / "Add a Site"
3. 输入你的域名（不含子域名），如 `yourdomain.com`
4. 选择 **Free** 计划
5. Cloudflare 会自动扫描现有 DNS 记录
6. 点击 "继续"

#### 修改域名服务器（NS）

Cloudflare 会给你两个 NS 记录，类似：
```
blake.ns.cloudflare.com
sara.ns.cloudflare.com
```

去你的域名注册商（阿里云/腾讯云等）：
1. 找到 DNS 设置 / 域名服务器设置
2. 将原来的 NS 记录改为 Cloudflare 提供的 NS
3. 保存

⏰ 等待生效（15 分钟 - 24 小时，通常很快）

Cloudflare 会发邮件通知生效。

#### 如果你的域名已经在 Cloudflare

直接跳到下一步。

### 3.3 在 Cloudflare 添加 DNS 记录

1. 在 Cloudflare Dashboard 选择你的域名
2. 左侧菜单 → **DNS** → **Records**
3. 点击 "Add record"

填写以下信息：

| 字段 | 值 | 说明 |
|-----|---|------|
| Type | **CNAME** | |
| Name | **lina** | 你的子域名前缀，可以改成其他的 |
| Target | **cname.vercel-dns.com** | Vercel 的 CNAME，固定不变 |
| Proxy status | **DNS only** (灰色云朵) ☁️ | **重要！一定要关闭 Proxied** |
| TTL | **Auto** | |

⚠️ **关键**：一定要点击橙色云朵，切换为灰色云朵（DNS only）！

4. 点击 "Save"

### 3.4 在 Vercel 添加自定义域名

1. 回到 Vercel → 你的项目
2. 点击顶部 **Settings** → 左侧 **Domains**
3. 在输入框输入：`lina.你的域名.com`（替换成你的实际域名）
4. 点击 "Add"

Vercel 会自动验证：
- 如果看到 ✅ Valid Configuration，说明配置成功
- 如果看到错误，等待几分钟 DNS 生效

### 3.5 启用 HTTPS（自动）

Vercel 会自动为你的自定义域名申请 SSL 证书，等待几分钟。

✅ **完成后，访问 `https://lina.你的域名.com`，应该能看到你的应用！**

---

## 第四步：优化访问速度（可选）

### 4.1 Cloudflare SSL 设置

在 Cloudflare → SSL/TLS：
- 加密模式：**Full (strict)**
- 这样兼容性和安全性最好

### 4.2 测试访问速度

在手机上：
1. 打开浏览器访问 `https://lina.你的域名.com`
2. 测试首次加载速度
3. 添加到主屏幕
4. 关闭浏览器，从主屏幕打开（测试缓存效果）

---

## 第五步：分享给家人

### 5.1 生成分享链接

你的应用地址：
```
https://lina.你的域名.com
```

### 5.2 添加到主屏幕指南

发送给家人：

**iOS (iPhone/iPad)：**
1. 用 Safari 浏览器打开上面的链接
2. 点击底部中间的"分享"按钮 📤
3. 向下滚动，找到"添加到主屏幕"
4. 点击"添加"

**Android：**
1. 用 Chrome 浏览器打开上面的链接
2. 点击右上角菜单（三个点）
3. 选择"添加到主屏幕"
4. 点击"添加"

### 5.3 账号管理

每个人需要：
- 注册自己的账号
- 记住自己的邮箱和密码
- 每个人的数据是独立的，互不干扰

---

## 更新应用

当你修改代码后：

```bash
git add .
git commit -m "更新说明"
git push
```

Vercel 会自动重新部署，1-2 分钟后生效。
家人刷新页面即可看到更新。

---

## 故障排查

### 问题 1：Vercel 部署失败

**检查**：
- 环境变量是否正确配置
- 查看 Vercel 的 Build Logs（部署日志）
- 在本地运行 `npm run build` 测试是否能构建成功

### 问题 2：自定义域名无法访问

**检查**：
- Cloudflare DNS 记录是否正确
- Proxy status 是否为 DNS only（灰色云朵）
- 等待 DNS 生效（可能需要 10-30 分钟）
- 在命令行测试：`nslookup lina.你的域名.com`

### 问题 3：登录后看不到数据

**检查**：
- Supabase 项目是否暂停（免费版长期不用会暂停）
- RLS 策略是否正确配置（参见 `RLS_POLICY_FIX.md`）
- 浏览器控制台是否有错误

### 问题 4：访问速度慢

**优化方案**：
1. 确认已添加到主屏幕（PWA 缓存）
2. 第一次加载会慢，后续会快很多
3. 如果确实太慢，可以考虑国内服务商（成本较高）

---

## 成本明细

- **GitHub**：免费（私有仓库）
- **Vercel**：免费（每月 100GB 带宽，足够用）
- **Cloudflare**：免费（DNS 服务）
- **域名**：已有，使用子域名，0 额外成本
- **Supabase**：免费（500MB 数据库，足够用）

**总成本：0 元** 🎉

---

## 安全提示

- ✅ `.env` 文件已在 `.gitignore`，不会泄露
- ✅ 环境变量在 Vercel 中配置，不在代码里
- ✅ RLS 策略保护，每个用户只能看到自己的数据
- ⚠️ 不要把 Supabase API keys 分享给别人

---

## 需要帮助？

如果遇到问题：
1. 先查看本文档的"故障排查"部分
2. 检查 Vercel 的部署日志
3. 检查浏览器控制台的错误信息
4. 找我帮忙 😊

