# 图标说明

项目需要以下两个图标文件用于 PWA：

## 需要的文件

1. `icon-192.png` - 192x192 像素的图标
2. `icon-512.png` - 512x512 像素的图标

## 如何创建

你可以：

1. **使用在线工具生成**：
   - 访问 https://www.favicon-generator.org/
   - 上传一张猫咪图片
   - 下载生成的图标

2. **使用 Emoji 生成**：
   - 访问 https://favicon.io/emoji-favicons/
   - 选择 🐱 猫咪 emoji
   - 下载并重命名为对应尺寸

3. **自己设计**：
   - 使用 Figma、Photoshop 等工具
   - 创建 192x192 和 512x512 两个尺寸
   - 导出为 PNG 格式

## 临时方案

在正式图标准备好之前，项目可以正常运行，只是添加到主屏幕时会显示默认图标。

## 放置位置

将生成的图标文件放在 `public/` 目录下：
```
public/
  ├── icon-192.png
  └── icon-512.png
```

