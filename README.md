# Parallax CakeCAD

CakeCAD 是一个以时间为主轴的开放式物质过程 CAD/PLM 工具。当前仓库正在实现曲奇首个纵切的本地交互原型。

## 当前原型

原型是本地用户端，不是 SaaS：

- React/Vite 前端：`http://127.0.0.1:5173`
- Node.js/Fastify 本地核心：`http://127.0.0.1:4317`
- 后端只监听 `127.0.0.1`
- 当前状态保存在内存中，重启后恢复演示初始状态

## 运行

本工作区已在 `.tools` 中配置项目专用 Node.js 24，因此可直接运行：

```powershell
.\dev.cmd
```

如果是重新克隆的源码仓库，请先安装 Node.js 24 LTS 和 pnpm 10，然后运行：

```powershell
pnpm install
pnpm dev
```

## 验证

```powershell
pnpm typecheck
pnpm test
pnpm build
```

## 文档

- 总规格：`docs/MASTER_SPEC.md`
- 曲奇纵切：`docs/specs/cookie-first-slice.md`
- localhost 技术基线：`docs/adrs/0001-localhost-prototype-runtime.md`
