<div align="center">

# Raconteur

**A self-hosted publishing platform for writers and photographers.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxtdotjs&logoColor=white)](https://nuxt.com)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite&logoColor=white)](https://sqlite.org)

</div>

---

## What is this

Raconteur is a personal blog and photo gallery built for people who write and photograph. It combines a Markdown writing environment with a full photo management pipeline — EXIF extraction, thumbnail generation, geolocation — in a single self-hosted application. No external database, no cloud dependency, no CMS overhead.

The design follows a "Press" aesthetic: bold typography, vermillion accent, thick rules, and a reading-first layout. Chinese text renders in LXGW WenKai alongside Fraunces and Source Serif 4 for Latin scripts.

## Why it exists

Most publishing tools either treat writing and photography as separate problems, or bundle them into a heavyweight CMS. Raconteur is built on a different premise: a writer who also photographs needs one space where both crafts live together, with the metadata and visual quality that each deserves.

## What you get

- **Writing** — A split-pane Markdown editor with live preview, keyboard shortcuts, image paste/drop, autosave, and draft/publish workflow. Content renders with drop caps, blockquotes, and full typographic control.
- **Photography** — A three-step upload pipeline (prepare → upload → process) with automatic EXIF extraction via ExifTool, thumbnail generation via Sharp, and thumbhash placeholders. Photos carry full metadata: camera, lens, exposure, GPS, tags.
- **WebGL Image Viewer** — A custom monorepo package (`@raconteur/webgl-image`) for high-performance, full-resolution image viewing with smooth zoom and pan.
- **Dashboard** — Post management, photo management, queue monitoring, and system settings in a clean admin interface with authentication.
- **Storage** — Local filesystem by default, S3-compatible storage as an option. No vendor lock-in.

## Quick start

```bash
# Install dependencies
pnpm install

# Initialize the database
pnpm db:push

# Start the dev server
npx nuxt dev --host
```

Then open `http://localhost:3000`. The first launch runs an onboarding wizard to create your admin account.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 4 (Vue 3, Nitro) |
| Database | SQLite via Drizzle ORM |
| Styling | Tailwind CSS v4 |
| Image processing | Sharp, exiftool-vendored, thumbhash |
| Auth | nuxt-auth-utils (cookie-based sessions) |
| State | Pinia |
| Storage | Local filesystem / S3 |
| Image viewer | Custom WebGL package (monorepo) |

## Project structure

```
app/            # Nuxt frontend — pages, layouts, components, composables
server/         # Nitro backend — API routes, services, database, plugins
shared/         # Cross-context types and utilities
packages/       # Monorepo packages (WebGL image viewer)
public/         # Static assets, fonts, storage
data/           # SQLite database and file storage (gitignored)
```

## License

[MIT](./LICENSE)

---

## 中文版

## 这是什么

Raconteur 是一个为写作和摄影爱好者打造的个人博客与照片画廊。它将 Markdown 写作环境与完整的照片管理流水线——EXIF 提取、缩略图生成、地理位置——整合在一个自托管应用中。无需外部数据库，无需云服务，无需 CMS。

设计采用「Press」风格：粗体排版、朱红色点缀、粗线条分隔、阅读优先的布局。中文使用霞鹜文楷（LXGW WenKai），英文使用 Fraunces 与 Source Serif 4。

## 为什么做这个

大多数发布工具要么把写作和摄影当作两个独立问题，要么塞进一个笨重的 CMS。Raconteur 的出发点不同：一个既写作又摄影的人，需要一个让两种创作共存的的空间，各自拥有应有的元数据和视觉品质。

## 你会得到什么

- **写作** — 分屏 Markdown 编辑器，支持实时预览、键盘快捷键、图片粘贴/拖放、自动保存、草稿/发布工作流。内容渲染支持首字下沉、引文块和完整排版控制。
- **摄影** — 三步上传流水线（准备 → 上传 → 处理），自动提取 EXIF 元数据（ExifTool），生成缩略图（Sharp），使用 thumbhash 占位符。照片携带完整元数据：相机、镜头、曝光、GPS、标签。
- **WebGL 图片查看器** — 自定义 monorepo 包（`@raconteur/webgl-image`），高性能全分辨率图片查看，支持平滑缩放和平移。
- **后台管理** — 文章管理、照片管理、队列监控、系统设置，带认证的简洁管理界面。
- **存储** — 默认本地文件系统，可选 S3 兼容存储。无厂商锁定。

## 快速开始

```bash
# 安装依赖
pnpm install

# 初始化数据库
pnpm db:push

# 启动开发服务器
npx nuxt dev --host
```

然后打开 `http://localhost:3000`。首次启动会运行引导向导创建管理员账号。

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Nuxt 4 (Vue 3, Nitro) |
| 数据库 | SQLite via Drizzle ORM |
| 样式 | Tailwind CSS v4 |
| 图片处理 | Sharp, exiftool-vendored, thumbhash |
| 认证 | nuxt-auth-utils (cookie 会话) |
| 状态管理 | Pinia |
| 存储 | 本地文件系统 / S3 |
| 图片查看器 | 自定义 WebGL 包 (monorepo) |

## 许可证

[MIT](./LICENSE)
