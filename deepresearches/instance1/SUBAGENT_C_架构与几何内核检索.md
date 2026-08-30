# Subagent C 原始报告：架构与几何内核选型检索

> Deep Research Wave 1 | 2026-08-30 | 角色：Retrieval Agent | 预算：8 WebSearch + 5 WebFetch | 来源编号：[31]-[45]

## Area Takeaways

**3:** Ink & Switch 的奠基论文给出了 local-first 的七条理想（①无加载等待 ②工作不困于单一设备 ③网络可选 ④无缝协作 ⑤长久可用"The Long Now" ⑥默认安全隐私 ⑦用户最终拥有与控制数据），并明确把 Git 称为"最接近真正 local-first 的软件"，但指出 Git 的两大短板——无实时细粒度协作、把非文本格式（含 CAD 文件）当二进制 blob——这直接支持 CakeCAD 用"事件日志/命令流 + 归一化中间表示"做版本树、而非二进制文件 diff 的路线。CRDT 选型上共识清晰：Automerge（Ink & Switch 自家出品）保留完整变更历史、提供类 Git 的版本/分支语义，天然契合"版本树 + 事件溯源"，代价是历史无限累积导致体积与性能问题（I&S 自己在 PushPin 中确认这是主要痛点）；Yjs 内存与性能显著更优（多个第三方基准称大文档上快 10–50 倍）但默认丢弃被删数据、历史语义弱，更适合大文本/实时协同文档。对单机为主的 CAD 桌面应用，若只做本地 undo/版本树，其实一个自研 append-only 命令日志（git 式内容寻址）就够，CRDT 主要在需要跨设备/协作时才有必要。

**4A:** Web/TS 侧最可信的纯 CSG 内核是 manifold-3d（elalish/manifold，Apache-2.0）：以拓扑鲁棒性为卖点，被 OpenSCAD、OCADml、Babylon.js 社区等集成为"可靠性有保证且远快于旧实现"的内核，其 npm 包即 WASM 构建、跨语言互操作性最好，但只有 mesh/CSG 语义、没有 B-Rep 参数化特征树，做旋转体/挤出/布尔/偏移涂层足够，做完整参数化历史则不够。opencascade.js 提供了浏览器里的完整 B-Rep 内核（ocjs.org 及多个实际项目在用），但痛点是 WASM 体积大、Emscripten 绑定笨重、STEP 转换等操作缓慢，适合查看/轻量编辑而非重交互建模主内核。桌面壳方面，2024–2026 的普遍结论是 Tauri 胜出（包体约 3–10 MB 对 Electron 的 120–200 MB，内存低约 50–60%），代价是使用系统 WebView 带来跨平台一致性风险；两者文件系统访问均可满足 local-first 需求。未找到 Three.js 严肃 CAD 应用的一手来源，但 OpenCascade.js/occt-import-js 生态本身就是"CAD-in-browser"的现实证据。

**4B:** Python 侧的事实标准是 CadQuery 与 build123d 这对姊妹项目：两者都包裹 OpenCascade 的官方绑定 OCP，都是 Apache/LGPL 友好的开源参数化 B-Rep 库；CadQuery 更成熟、生态大、链式 API 直观，build123d 是其社区发起的更现代重写（位置无关语法、完整暴露 OCCT 能力），二者共享 r/cadquery 社区与生态，天然提供"特征树式"参数化建模语义，与 CakeCAD 的 DAG 需求高度吻合。最关键的发现：CadQuery 官方讨论区已有 "OCP.wasm" 成果——OpenCascade + OCP 被成功用 Pyodide 编译为 WASM，build123d 可完全在浏览器中运行，说明 Python 几何栈进浏览器已从理论变为现实，但交互式性能仍受限于 WASM 体积与编译延迟，宜作为云端/预览路径而非主交互路径。桌面形态下现实的技术栈为 CadQuery/build123d（建模）+ trimesh/PyMeshLab（网格后处理/3D 打印导出）+ PySide6/Qt（成熟 3D 视口与复杂 UI）或 pywebview（Web UI + 本地内核），textual 仅适合 TUI 不适合 3D。

**4C:** 多方来源（nTop 官方、demystifyingplm、行业讨论）的共识：B-Rep 在低中复杂度机械件上精确但"圆角、偏移、薄壁、布尔经常失败且随拓扑面数增长而崩溃"，而隐式/SDF 表示"运算从不失败、可完全自动化"，且 SDF 天然编码偏移/涂层信息（"距离场就是即时的 offset"，抬升/降低等值面即内偏/外偏）——对 CakeCAD 的淋面、涂层壳、滴落这类有机形状，SDF/隐式是比 B-Rep 更稳的表达。nTop 明确把"有机形状、空间渐变材料"列为 B-Rep 不擅长的场景，正好是食品造型的核心；voxel 路线（MagicaVoxel 类）适合体块化风格造型但表面分辨率受网格限制。检索预算内未找到"SDF 用于食品/软体建模"的直接先例来源，这是明确的资料空白；合理的混合路线是"参数化 B-Rep 做主体（旋转/挤出/布尔），SDF 做涂层/淋面层，最终 mesh 化给视口与 3D 打印"。

## Sources

[31] Martin Kleppmann, Adam Wiggins, Peter van Hardenberg, Mark McGranaghan — Local-first software: You own your data, in spite of the cloud (Ink & Switch essay) — https://www.inkandswitch.com/essay/local-first/ — 访问日期 2026-08-30 — Tier: 1
Summary: 全文获取。定义 local-first 七条理想：1. No spinners（即时响应）；2. Your work is not trapped on one device（多设备同步）；3. The network is optional（离线可用）；4. Seamless collaboration（实时协作）；5. The Long Now（数据长久可访问）；6. Security and privacy by default；7. You retain ultimate ownership and control。评述 Git 为"最接近 local-first"的系统（本地仓库是主副本），CRDT（其自研 Automerge）为最有希望的基础技术。
Key quotes: "Git and GitHub... are perhaps the closest thing we have to a true local-first software package"；"Git is highly optimized for code... other file formats are treated as binary blobs"；"CRDTs accumulate a large change history, which creates performance problems"；"the FRP model of React fits well with CRDTs... all changes to the underlying state are made through a single function (a 'reducer')"。

[32] Kleppmann et al. — Local-first software (Onward! 2019, ACM 正式版) — https://dl.acm.org/doi/10.1145/3359591.3359737 — 访问日期 2026-08-30 — Tier: 1
Summary: [31] 的同行评审版论文出处（Onward! 2019），可作为正式引用。内容与 essay 相同，学术可信度最高。
Key quotes: 同 [31]。

[33] HN 讨论串 — "In practice most projects seem to use Yjs rather than Automerge. Is..." — https://news.ycombinator.com/item?id=41012895 — 访问日期 2026-08-30 — Tier: 3
Summary: Automerge 与 Yjs 的核心差异：Automerge 保存文档的完整历史（删除项永久保留，有得有失），因而天然具备版本历史/类 Git 能力；Yjs 更轻但牺牲持久历史。社区实际采用率上 Yjs 占多数。
Key quotes: "Automerge stores the entire history of a document, so unlike Yjs, deleted items are stored forever — with the costs and benefits that brings."

[34] PkgPulse — Yjs vs Automerge vs Loro: CRDT Libraries 2026 — https://www.pkgpulse.com/guides/yjs-vs-automerge-vs-loro-crdt-libraries-2026 — 访问日期 2026-08-30 — Tier: 3
Summary: 对比三大 CRDT 库的采用度与定位：Yjs 采用最广；Automerge（约 85K 周下载）以"类 Git 的变更历史"擅长文档级版本管理；Loro（Rust 实现，约 12K 下载）基准速度最快。另有同源比较文章称大文档基准下 Yjs 性能领先 Automerge 10–50 倍、内存更小（kanopylabs）。
Key quotes: "Automerge (~85K downloads) excels at document-level versioning with its Git-like change history"；"Benchmarks consistently show Yjs outperforming Automerge by 10x to 50x on large documents, with significantly smaller memory footprints."

[35] Kevin Tange (Yjs 作者) — "Compared to Automerge", yjs/yjs Issue #145 — https://github.com/yjs/yjs/issues/145 — 访问日期 2026-08-30 — Tier: 2
Summary: Yjs 维护者第一方对比（页面抓取超时，以下据检索摘要）：若共享大型文本/富文本文档，Yjs 是更优选择，因为其算法专门为该场景优化、文档编码更小。可作为"文档型/文本型数据选 Yjs"的权威依据；对结构化树状文档则两者皆可、按历史需求取舍。
Key quotes: "I would argue that Yjs is the better choice if you plan to share huge (text / rich-text) documents, because... its algorithm is specifically [optimized for them]."

[36] Emmett Lalish et al. — elalish/manifold: Geometry library for topological robustness (GitHub README) — https://github.com/elalish/manifold — 访问日期 2026-08-30 — Tier: 2
Summary: manifold 的定位即"拓扑鲁棒性几何库"，核心为对三角网格的布尔（CSG）运算；官方提供 npm 包 manifold-3d（WASM/Emscripten 构建），"不如原生 C++ 快，但互操作性无可匹敌"，并附 Python Colab 示例。作者 Emmett Lalish 曾在 Google/Chromium 生态从事几何引擎工作（SDFToolkit 背景）。项目活跃、多语言绑定齐全（JS/TS、Python、Rust、C#）。
Key quotes: "This uses our npm package, manifold-3d, built via WASM. It's not quite as fast as our raw C++, but it's hard to beat for interoperability."

[37] Babylon.js 官方论坛 — "Is there a roadmap to enhance the CSG operations?" — https://forum.babylonjs.com/t/is-there-a-roadmap-to-enhance-the-csg-operations/52978 — 访问日期 2026-08-30 — Tier: 2
Summary: manifold 团队自述其内核已被 OpenSCAD、OCADml 以及 Space 等知名项目集成，理由是"可靠性有保证"且比旧的 CSG 实现快约千倍。佐证 manifold 已是开源 CSG 内核的事实标准之一（注：为厂商自述，需折扣看待）。
Key quotes: "[OpenSCAD], Space, and OCADml have all integrated our Manifold geometry kernel! Why? Because its reliability is guaranteed and it's 1,000 times faster than [previous implementations]."

[38] OpenCascade.js 官方站 (ocjs.org) — OpenCascade.js: Port of the OpenCascade CAD library to JavaScript and WebAssembly — https://ocjs.org/ — 访问日期 2026-08-30 — Tier: 1（官方项目）
Summary: opencascade.js 将完整 OpenCASCADE CAD 内核移植到 JS/WASM，用于构建浏览器或云端 CAD 应用；occt-import-js 为同作者的 STEP/IGES/BREP 导入专用精简构建（体积小得多，只读转换）。证明"浏览器内跑真 B-Rep 内核"可行且已有产品化路径。
Key quotes: "Port of the OpenCascade CAD library to JavaScript and WebAssembly. Build web-enabled CAD applications that run in the browser or in the cloud."

[39] OCCT3D 论坛 — "OpenCascade.js (Node.js) | TransferRoots() Very Slow" — https://occt3d.com/dev/content/opencascadejs-nodejs-transferroots-very-slow-need-optimized-way-get-bounding-box-faces/ — 访问日期 2026-08-30 — Tier: 3
Summary: 一线开发者痛点样本：即便在 Node 侧，opencascade.js 读取单个 STEP 零件的 TransferRoots 也非常慢，说明 WASM+绑定层的性能开销在重几何操作上真实存在，重交互建模不宜全程依赖。
Key quotes: "I'm using OpenCascade.js in a Node.js project to read a single-part STEP file... TransferRoots [is] Very Slow."

[40] Rustify — Tauri vs Electron for Desktop Apps in 2026 — https://rustify.rs/articles/rust-tauri-vs-electron-2026 — 访问日期 2026-08-30 — Tier: 3
Summary: 包体量级对比：Tauri 3–10 MB vs Electron 120–200 MB，20–50 倍差距，直接影响下载、更新与分发；另有基准称 Tauri 内存约低 58%（Reddit 汇编）。Tauri 使用系统 WebView，存在跨平台渲染一致性风险；Electron 自带 Chromium、行为一致。两者均支持完整本地文件系统访问，满足 local-first 存储。
Key quotes: "Tauri's 3–10 MB bundle vs Electron's 120–200 MB is not a minor optimization. It's a 20–50x size difference."

[41] CadQuery 团队/社区 — CadQuery discussions #1876: "OCP.wasm: OpenCascade in WebAssembly (build123d now runs in the browser)" — https://github.com/CadQuery/cadquery/discussions/1876 — 访问日期 2026-08-30 — Tier: 2
Summary: 关键一手证据：开发者成功用 Pyodide 将 OpenCascade 与 OCP Python 绑定编译为 WebAssembly，使 build123d 完全在浏览器内运行。说明"Python 几何栈进浏览器"可行；但 Pyodide 载荷大、启动慢，适合演示/轻量计算而非高帧率交互建模。
Key quotes: "I've successfully compiled OpenCascade and the OCP Python wrapper to WebAssembly using Pyodide, enabling build123d to run entirely in the browser."

[42] build123d 官方文档 — About — build123d 0.10.0 documentation — https://build123d.readthedocs.io/en/v0.10.0/ — 访问日期 2026-08-30 — Tier: 1（官方文档）
Summary: build123d 是"基于 Python 的参数化 BREP 建模框架，支持 2D/3D CAD，构建于 Open Cascade 几何内核之上，提供干净、完整的 [API]"。它是 CadQuery 社区主导的现代重写，与 CadQuery 共享 OCP 绑定与生态（r/cadquery），支持位置无关的组合式建模与特征式参数化流程。
Key quotes: "Build123d is a Python-based, parametric (BREP) modeling framework for 2D and 3D CAD. Built on the Open Cascade geometric kernel, it provides a clean, fully [featured] API."

[43] grandpacad.com — OpenSCAD vs CadQuery vs Build123d: which CAD engine... — https://grandpacad.com/en/blog/openscad-vs-cadquery-vs-build123d — 访问日期 2026-08-30 — Tier: 3
Summary: 第三方横向对比：CadQuery 与 build123d 都是包裹 OpenCASCADE（与 FreeCAD 同源的 B-Rep 内核）的 Python 库；CadQuery 更成熟易用、链式选择器 API 直观；build123d 更现代、与 OCCT 贴合更紧。可支撑"选 Python 路线即选 OCCT 内核"的判断。
Key quotes: "CadQuery and Build123d are Python libraries that wrap OpenCASCADE, the same B-rep (boundary representation) kernel that sits under FreeCAD."

[44] Blake Courter (nTop) — B-rep vs. implicit modeling: Understanding the basics — https://www.ntop.com/resources/blog/understanding-the-basics-of-b-reps-and-implicits/ — 访问日期 2026-08-30 — Tier: 2（厂商但为首席技术官的技术长文）
Summary: 全文获取。核心论点：B-Rep 的圆角、偏移、布尔等常规操作"经常失败、需熟练用户特殊处理"，且面数上万即不可用；隐式建模基于"永不失败"的数学，可完全自动化。SDF（符号距离场）用标量场定义形状，等值面即边界，"距离场天然编码了即时偏移物体所需的全部信息"——抬升/降低等值面即内偏/外偏，这正是涂层/淋面壳的理想语义。B-Rep 不擅长的场景被明确列为"高细节设计、有机形状、扫描数据、点阵/多孔结构、空间渐变材料"。
Key quotes: "Common modeling operations such as rounds, offsets, and even booleans often fail... Implicit 3D models are based on a different type of math that never fails"；"a distance field encodes all of the information needed to instantly offset an object"；"organic shapes, scan data, lattice and porous structures, spatially varying materials... are not well represented by B-reps."

[45] Blender devtalk — "Blender's architecture concerning everything nodes" — https://devtalk.blender.org/t/blenders-architecture-concerning-everything-nodes/9888 — 访问日期 2026-08-30 — Tier: 3（官方开发者论坛）
Summary: 关于 Blender"万物皆节点"架构的社区讨论，反映其惰性求值思路：数据与计算都被视为资源与事件触发，"bevel 修改器与流体模拟没有区别"——与 CakeCAD 过程 DAG 的惰性求值设计同构。注：关于 Blender/Figma 命令模式与 undo 实现的一手公开讲稿在本预算内未检索到高质量来源，此为资料空白。
Key quotes: "Data (ram) and time (cpu ticks) are just resources and event triggers. There is no difference between a bevel modifier and fluid simulation."

**检索说明与空白**：已用满 8 次 WebSearch + 5 次 WebFetch；其中 3 次 GitHub 页面（manifold README 全文、yjs issue #145、CadQuery discussion #1876）抓取超时，相关内容仅基于搜索摘要，可信度略降。未覆盖/资料空白：①Blender、Figma、Fusion 360 的官方命令/undo 架构讲稿；②SDF 用于食品/软体建模的直接先例；③Three.js 严肃 CAD 应用案例清单。建议后续由其他检索代理补齐。
