# Image Background Remover

一个基于 Cloudflare Workers 和 remove.bg API 的在线图片背景移除工具。

## 功能特点

- 🖼️ 支持拖拽上传图片
- ⚡ 快速处理，实时预览
- 📥 一键下载透明背景 PNG
- 🌐 部署在 Cloudflare edge，全球加速

## 技术栈

- **前端**: HTML + CSS + JavaScript
- **后端**: Cloudflare Workers
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

### 3. 配置 API Key

在 Cloudflare Dashboard 中设置环境变量 `REMOVE_BG_API_KEY`，或直接修改 `wrangler.toml`:

```toml
[vars]
REMOVE_BG_API_KEY = "your-api-key-here"
```

### 4. 本地开发

```bash
npm run dev
```

### 5. 部署

```bash
npm run deploy
```

## 获取 remove.bg API Key

1. 访问 [remove.bg](https://www.remove.bg/api)
2. 注册账号
3. 获取免费 API Key（每月 50 次免费调用）

## 项目结构

```
├── src/
│   └── index.js          # Cloudflare Worker 代码
├── public/
│   ├── index.html        # 主页面
│   ├── style.css         # 样式文件
│   └── app.js            # 前端逻辑
├── wrangler.toml         # Cloudflare 配置
├── package.json          # 项目配置
└── README.md             # 项目说明
```

## License

MIT
