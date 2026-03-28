# Image Background Remover

一个基于 Next.js + Tailwind CSS 和 remove.bg API 的在线图片背景移除工具。

## 功能特点

- 🖼️ 支持拖拽上传图片
- ⚡ 快速处理，实时预览
- 📥 一键下载透明背景 PNG
- 🎨 现代化 UI，响应式设计
- ☁️ 部署在 Cloudflare Pages，全球加速

## 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **后端**: Cloudflare Pages Functions
- **API**: [remove.bg API](https://www.remove.bg/api)

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/liufanqie/2026.3.28image-background-remover.git
cd 2026.3.28image-background-remover
```

### 2. 安装依赖

```bash
npm install
```

### 3. 本地开发

```bash
npm run dev
```

访问 http://localhost:3000

> 注意：本地开发时 API 调用需要配置环境变量，或部署到 Cloudflare 后测试

### 4. 部署到 Cloudflare Pages

1. 将代码推送到 GitHub
2. 在 Cloudflare Dashboard 中创建 Pages 项目
3. 连接 GitHub 仓库
4. 设置构建命令：`npm run build`
5. 设置输出目录：`out`
6. 添加环境变量：`REMOVE_BG_API_KEY`

## 环境变量

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `REMOVE_BG_API_KEY` | remove.bg API 密钥 | [获取地址](https://www.remove.bg/api) |

## 项目结构

```
├── app/
│   ├── layout.tsx       # 根布局
│   ├── page.tsx         # 主页面
│   └── globals.css      # 全局样式
├── components/
│   ├── UploadArea.tsx   # 上传区域组件
│   ├── Preview.tsx      # 预览组件
│   ├── Loading.tsx      # 加载组件
│   └── ErrorMessage.tsx # 错误提示组件
├── functions/
│   └── api/
│       └── remove.ts    # Cloudflare Pages Function
├── next.config.js       # Next.js 配置
├── tailwind.config.js   # Tailwind 配置
├── tsconfig.json        # TypeScript 配置
└── package.json         # 项目依赖
```

## API 说明

### POST /api/remove

上传图片并返回去背景后的 PNG 图片。

**请求：**
- Content-Type: `multipart/form-data`
- Body: `file` - 图片文件（JPG/PNG/WebP，最大 10MB）

**响应：**
- 成功：二进制 PNG 图片
- 失败：`{ "error": "错误信息" }`

## License

MIT
