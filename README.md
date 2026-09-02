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

- 总文档（唯一现行产品文档）：`docs/MASTER_SPEC.md`
- 研发工作稿与台账（原始点+答案+历史旧稿）：`docs/WORKBOOK.md`
- 元操作研究（命令/内核/效果原语分解，研究中）：`docs/METAOPS.md`
- 用户手写 L0 手稿：`docs/HANDDRAFT1.md`
