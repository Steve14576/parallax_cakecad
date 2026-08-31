# ADR-0001：localhost 原型运行时与工具基线

> 状态：已接受  
> 日期：2026-08-31  
> 上游：`docs/MASTER_SPEC.md`  
> 适用范围：曲奇首个纵切的源码原型

## 背景

CakeCAD 是本地用户端软件，不是 SaaS。当前黑客松交付重点是可运行源码和可体验交互，而不是桌面安装包。

首个原型需要同时满足：

- 在用户电脑上离线或本机运行；
- 前端能快速迭代 Markdown、DAW、热区/冷区、CMD 和代理工作区；
- 核心状态与业务逻辑不塞进 React 组件；
- 后续封装为 Electron 或 Tauri 时尽量复用代码；
- 不提前承担桌面打包、代码签名、跨平台 sidecar 和自动更新成本。

## 决策

### 1. 产品形态

首个原型采用“本地后端 + localhost 前端”的源码运行方式：

```text
用户电脑
├── Node.js/TypeScript 本地后端
│   └── 仅监听 127.0.0.1
└── React/Vite 前端
    └── 通过本地 HTTP API 访问后端
```

它不是远程服务，不要求登录，不依赖云端数据库，不向局域网公开监听端口。可选 AI 能力不属于首个启动闭环。

### 2. JavaScript 运行时

开发和原型运行时采用 Node.js 24 LTS，不采用 Bun 作为项目运行时。

理由：

- Node.js 24 是当前 LTS，第三方库、编辑器、测试和桌面封装路径更稳定；
- CakeCAD 当前瓶颈是交互验证，而不是依赖安装速度；
- Bun 仍在持续补齐 Node.js API 兼容性，当前没有足以抵消兼容风险的项目收益；
- Electron 原生使用 Node.js；Tauri 官方支持把 Node.js 应用打成 sidecar。

Bun 不被永久排除；若以后有可验证收益，可以单独提案。

### 3. 包管理与工程基线

- 包管理器：pnpm；
- 语言：TypeScript，启用严格类型检查；
- 前端：React + Vite；
- 本地 API：Fastify；
- 共享契约：TypeScript 类型 + Zod 运行时校验；
- 单元/组件测试：Vitest；
- 浏览器流程测试：Playwright；
- 格式化：Prettier；
- 静态检查：ESLint。

选择 Fastify 是因为它适合本地结构化 API、支持清晰的插件与校验边界，同时不会把领域逻辑绑定到框架。Zod 用于确保浏览器与本地后端对请求和响应的理解一致。

### 4. 代码边界

采用 pnpm workspace：

```text
apps/
├── web/       React 交互界面
└── server/    仅监听本机的 HTTP 适配层
packages/
├── core/      与 UI、HTTP、桌面壳无关的领域逻辑
└── contracts/ 前后端共享的 API 契约与校验
```

关键纪律：

- React 组件不得成为事实底座；
- `packages/core` 不依赖 React、Fastify、Electron 或 Tauri；
- HTTP 只是当前传输适配器，不是领域模型；
- localhost 地址和端口可配置；
- 业务命令与查询通过明确接口暴露。

### 5. 原型数据

第一阶段使用内存状态和单个 JSON 导入/导出，不提前决定正式项目文件格式、数据库和事件持久化方案。

JSON 只用于恢复演示状态和便于检查，不构成长期文件格式承诺。

### 6. 工作区与时间轨

首个纵切采用 HTML/SVG 实现二维语义代理工作区和 DAW。暂不引入 Three.js、CAD 内核和可编辑节点图。

这只是首个验证载体，不改变 `MASTER_SPEC` 中按需几何和未来 2.5D/3D 的能力边界。

## 桌面封装兼容策略

### Electron

未来 Electron 主进程本身运行在 Node.js 环境中，可以启动或直接托管当前本地后端。前端与领域包可继续复用；需要替换的主要是启动、窗口、文件对话框和安全桥接。

### Tauri

Tauri 官方支持外部二进制 sidecar，也提供把 Node.js 应用打成自包含二进制的指南。Node sidecar 可以通过 localhost、stdin/stdout 或本地 socket 与前端或 Tauri 壳通信。

这种方案可行，但不是当前必须承担的默认路径。它会增加：

- 各操作系统和 CPU 架构的 sidecar 构建；
- 进程启动、退出与崩溃恢复；
- 端口选择和本地请求鉴权；
- Tauri shell 权限；
- 安装包体积和发布测试。

因此当前只保持后端边界清晰，不创建 Tauri 工程。未来也可以把部分能力改写为 Rust command，而无需改写 React 界面和纯 TypeScript 领域逻辑的概念接口。

## 安全边界

- 后端默认绑定 `127.0.0.1`，不得绑定 `0.0.0.0`；
- 开发阶段由 Vite 代理 `/api`，避免任意跨域开放；
- 未来独立启动前端和后端时，应使用随机可用端口与每次启动生成的会话令牌；
- 不把项目文件路径、任意命令执行或 sidecar 权限直接暴露给网页；
- 不因“只是 localhost”而跳过输入校验。

## 延后决策

以下内容等待交互原型和事实模型验证后再决定：

- Electron 或 Tauri；
- 正式项目文件格式和数据库；
- Three.js、OpenCascade 或其他几何栈；
- WebSocket、本地 socket 或 IPC；
- 分支与事件历史的持久化结构；
- Agent 与科学计算进程的部署方式。

## 后果

优点：

- 能最快交付可体验源码；
- 前后端和领域逻辑边界清楚；
- 不依赖桌面壳也能验证完整工作流；
- 后续 Electron/Tauri 都有迁移路径。

代价：

- 开发时需要同时启动前端和本地后端；
- localhost 方案必须处理端口和本地安全；
- 正式打包时仍需完成宿主生命周期与文件系统集成；
- Node sidecar 若被采用，不能理解为零成本打包。
