# Subagent D 原始报告：交互先例与UX模式检索

> Deep Research Wave 1 | 2026-08-30 | 角色：Retrieval Agent | 预算：8 WebSearch + 5 WebFetch | 来源编号：[61]-[72]

## Area Takeaways

**5A:** 参数化 CAD 的共识是：特征树/时间线本质上是一条"可回滚的历史记录"，用户心智模型就是"回到过去改一处，然后重放"，但所有主流系统最大的痛点是**重建慢**和**历史断裂报错**（SolidWorks/Onshape 被反复吐槽"slow rebuilds、trees that like to break"），Fusion 360 的水平时间线和"不捕获设计历史"的逃生舱因此获得好评。实践者明确区分了"特征树（树形、含装配/层级）"与"时间线（线性、可拖动指针）"两种隐喻，并认为对流畅探索式设计，能随时"抛弃历史、直接建模"是一种必要的安全阀。因此 CakeCAD 的特征树应把**快速重建 + 显式的错误修复流（如 Onshape Repair Manager 式的批量修复）+ 历史可丢弃/可降级**作为一等交互，而不只是堆砌特征列表。

**5B:** "状态随时间变化"的最强先例来自 Bret Victor：让时间"可抓握"（slider 逐帧 scrub）、"可见"（把整条执行轨迹叠加/画在时间轴上，让人一眼看到 shape of the process）、"可对比"（前后帧并置）——这正是 CakeCAD 时间轴的理论基础。视频/动效工具的实证补充是：scrub 的响应感来自**低延迟预览 + 微交互反馈**，而 After Effects 的 Responsive Design–Time 提供了"保护关键帧区域不被拉伸改写"的机制，直接对应 CakeCAD 的"锁定测量点"。Git 可视化（及 Onshape 的版本/分支模型）说明"历史 = 可分叉、可并排比较、可回到任意节点的空间结构"是被验证过的导航范式，但本次预算内未找到 GitKraken/Fork 的一手深度分析，属轻微缺口。

**5C:** 电子表格是"随手编辑 + 自动重算 + 局部锁定"的原型：Nardi 的研究指出它成功于**具体可见的数据呈现 + 即时反馈（压缩了 test-evaluate-debug 循环）**，且公式构成"隐式控制流"——改一个格子会级联传播，用户凭直觉信任这种传播。Ink & Switch 的 Potluck 给出"先自由记录、后逐步加结构"的 **gradual enrichment** 范式，验证了"文档长期处于半结构化/半一致状态仍然有用"，与 CakeCAD 的 sketch-state → deliberate reconcile 完全同构；其"动态注解覆盖在原文之上"也是影响预览（不破坏原稿的叠加显示）的好先例。缺口：driven/driving 尺寸约束、Blender 脏标记等"过期状态可视化"的具体一手资料未能在预算内抓到，建议主报告用电子表格传播 + Potluck 渐进富化作为该区的理论支柱。

**5D:** 节点编辑器生态已高度成熟（React Flow、Rete.js、LiteGraph、awesome-node-based-uis 清单），社区共识是：**自研节点编辑器成本高（连线、端口、命中检测、性能），选型主要看框架契合度**（React 项目选 React Flow，框架无关选 LiteGraph/Rete），它们确立了端口、连线、可自定义节点内容等标准交互词表。Houdini 与 Blender 几何节点的对比显示两种哲学：Houdini 全节点、强大但上手慢（"takes longer to be productive"），Blender 走"修改器优先、节点可选"的低门槛路线——从业者回顾普遍认可**把参数化能力藏在熟悉的直接操作之下**才是好的渐进暴露。这恰好为 CakeCAD"刻意回避通用节点图、用特征树+时间线+电子表格式数值策略"的定位提供了反面验证：节点图是表达力上限最高但学习曲线最陡的形态。

## Sources

[61] Bret Victor — Learnable Programming: Designing a programming system for understanding programs — https://worrydream.com/LearnableProgramming/ — 2026-08-30 — Tier: 1
Summary: 提出编程环境设计原则清单，核心是让执行"可跟随、可看见、可把玩"。其中"Follow the flow"一节直接示范了用 slider 对程序执行进行 scrub、把每行执行画在时间轴上、把所有帧半透明叠加等交互，是"时间轴展示状态"的最权威先例。
Key quotes: "the programmer uses a slider to scrub through the execution… She can go backwards and forwards, dwell in difficult areas, and compare what is happening at different times"; "Transforming flow from an invisible, ephemeral notion into a solid thing that can be studied explicitly"; "'Flattening time' allows the learner to see the process and its trajectory as two representations of the same thing"。

[62] Bonnie A. Nardi & James R. Miller (Hewlett-Packard Labs) — The spreadsheet interface: A basis for end-user programming — https://www.miramontes.com/writing/spreadsheet-eup/ — 2026-08-30 — Tier: 1（经典 EUP 研究，被引 150+）
Summary: 论证电子表格为何对非程序员有效：具体可见的数据呈现、即时反馈、把公式应用到单元格块。研究还发现普通用户只用不到 10 个函数，但公式网络构成"隐式控制流"——任意单元格可关联任意单元格，改一处触发级联更新。
Key quotes: "spreadsheets provide a concrete, visible representation of data values, immediate feedback to the user, and powerful features such as applying formulas to blocks of cells"; "Users' own formulas contain an implicit flow of control… When a value in one cell changes it may trigger a series of changes"; "This compression of the test-evaluate-debug cycle is an important feature of spreadsheets"。

[63] Ink & Switch (Riffle 等) — Potluck: Dynamic documents as personal software — https://www.inkandswitch.com/potluck/ — 2026-08-30 — Tier: 1（Ink & Switch 官方研究）
Summary: 提出 gradual enrichment（渐进富化）策略：让用户先以自然、混乱的方式记录信息，只在需要时逐步叠加结构与计算行为；电子表格是其明确灵感来源。Potluck 用"可扩展搜索 + 类电子表格的实时公式 + 覆盖在原文上的动态注解"把文本文档变成可交互软件，验证了"半一致状态长期可用、按需和解（reconcile）"的工作流。
Key quotes: "allowing users to record information in natural, messy ways, and then slowly adding formal structure and computational behavior only as needed"; "a user can start writing down data in a freeform grid, without committing to any particular structure… At every point along the way, the artifact remained useful"; "Formulas are written using JavaScript, in a live programming environment that resembles a spreadsheet"。

[64] Josh Flowers（工业设计师，15 年 CAD 经验） — Fusion 360 vs Solidworks vs Siemens NX vs Onshape — https://www.joshflowers.xyz/blog/solidworks-vs-siemens-nx-vs-onshape-vs-fusion360 — 2026-08-30 — Tier: 3（一手实践者回顾）
Summary: 对四大参数化 CAD 的长文对比。核心观察：SolidWorks/Onshape "slow rebuilds、not very robust to errors、feature trees that often like to break"；NX 的 "remove attributes" 与 Fusion 的 "Do not capture design history" 允许丢弃整棵特征树转为直接建模，被作者视为大幅提速的关键工作流；作者认为在流畅设计过程中不应被特征树绑架。
Key quotes: "Feature trees that often like to break"; "Deleting your feature tree saves you profound effort and keeps you focused on 'what's next' instead of constantly fixing your tree"; "That approach isn't appropriate for every modelling task, especially during a fluid design process"。

[65] Onshape（PTC 官方博客） — Tackling History-Based Errors in Parametric CAD (Repair Manager) — https://www.onshape.com/en/blog/tackling-history-based-errors-parametric-cad-repair-manager — 2026-08-30 — Tier: 1（官方产品文档；抓取只返回摘要，正文为 JS 渲染）
Summary: 官方承认"使用基于历史的参数化工具必然需要随变更修复特征"，Onshape 的解法是用云端数据管理 + Repair Manager 批量处理断裂的特征引用。相关搜索结果还包括 Onshape "Rollback Bar"（在模型历史任意点跳转/回滚）教学，以及从业者讨论 Onshape 版本/分支模型（"versions and branches"）——即 Onshape 把 Git 式分支直接带进了 CAD 历史管理。
Key quotes: "Working with history-based parametric design tools inevitably means you'll have to repair features as changes happen"; 同系搜索命中："Use it [the Rollback Bar] to jump to any point in your model history"。

[66] Reddit r/SolidWorks 社区讨论 — "How is working with the timeline different than Fusion 360" — https://www.reddit.com/r/SolidWorks/comments/1kql8ba/ — 2026-08-30 — Tier: 3
Summary: 用户自发辨析两种历史隐喻：SolidWorks 叫"特征树"（树形结构），"timeline 是运动仿真的另一回事"；反映从业者普遍把线性时间线与树形特征列表当作不同心智模型。评论区同时提到自顶向下设计场景下时间线的实际用法。
Key quotes: "It's called a feature tree in Solidworks. The timeline is something different for motion studies."

[67] Adobe 官方帮助文档 — After Effects: Responsive design – Time — https://helpx.adobe.com/after-effects/desktop/motion-graphics/add-responsive-design/responsive-design.html — 2026-08-30 — Tier: 1（官方文档）
Summary: After Effects 允许在拉伸/重定时动画时**保护由关键帧组成的区域（如淡入淡出）不被改写**——即"锁定点 + 范围化重解"的现成产品先例。另有社区/社媒资料描述时间轴交互的核心体验目标为平滑 scrub、响应式播放控制与细微微交互反馈。
Key quotes: "You can protect the fade-in/out regions (comprising keyframes) and extend the animation";（Seative Digital, Tier 3）"Editing Timeline Interaction explores smooth timeline scrubbing, responsive playback controls, and subtle micro-[interactions]"。

[68] SourceCAD — SolidWorks vs Fusion 360: Which One Should You Learn — https://sourcecad.com/blog/solidworks-vs-fusion-360-which-one-should-you-learn — 2026-08-30 — Tier: 3
Summary: 教学向对比文，补充 5A：SolidWorks 在大装配下"feature tree stays organized, mates behave predictably"，强调特征树的可组织性/可预测性是留存用户的核心理由；与 [64] 的"树会断"形成互补——用户要的是组织良好且重建可靠的历史。
Key quotes: "SOLIDWORKS handles large assemblies much more reliably than Fusion. The feature tree stays organized, mates behave predictably."

[69] xyflow 团队 — awesome-node-based-uis (GitHub 精选清单) — https://github.com/xyflow/awesome-node-based-uis — 2026-08-30 — Tier: 2
Summary: 节点编辑器生态的事实索引：收录 litegraph.js（"a graph node engine and editor"）、Rete（"framework for visual programming and node editors"）、React Flow 及大量产品案例，说明该品类交互模式（节点、端口、连线）已高度标准化、框架成熟。可作为"不采用节点图"决策时列举替代方案的证据基线。
Key quotes: "litegraph.js - A graph node engine and editor"; "rete - Framework for visual programming and node editors"。

[70] Reddit r/node 社区 — "Choosing graph editor" + 相关选型讨论 — https://www.reddit.com/r/node/comments/10o43dg/choosing_graph_editor/ — 2026-08-30 — Tier: 3
Summary: 从业者选型共识：LiteGraph 功能全面、开箱即用；React 技术栈内首选 React Flow；Medium 对比文（Tier 3）补充"从零自研节点编辑器很难，需要处理连线、命中、性能等大量细节"。整体说明节点编辑器的交互基建成本极高，是 CakeCAD 回避通用节点图的合理注脚。
Key quotes: "Litegraph looks very good for what you want to do. If you're in the react environment i would also argue react-flow should do the job well";（Medium, Tier 3）"Building a node-based editor from scratch is difficult. You need to handle [wiring/ports/…]"。

[71] Artivoxa — Houdini vs Blender: Procedural 3D Compared — https://www.artivoxa.com/houdini-vs-blender-procedural-3d-compared/ — 2026-08-30 — Tier: 3
Summary: 对比两种程序化建模哲学：Houdini 以节点网络为唯一范式（表达力最强、全程序化），Blender 几何节点把程序化作为修改器体系内的可选路径（门槛更低）。结论是初学者友好度来自"不强制全节点化"。与 SideFX 官方论坛的从业者陈述互相印证。
Key quotes: "Procedural modeling in Houdini and Blender begins from two distinct philosophies";（SideFX forum, Tier 3）"Houdini takes longer to be productive than almost any other 3D application."

[72] Advait Sarkar 等 (Microsoft Research/Cambridge) — Spreadsheet Use and Programming Experience (ACM CHI 2020) — https://dl.acm.org/doi/fullHtml/10.1145/3334480.3382807 — 2026-08-30 — Tier: 1（同行评审）
Summary: 实证研究电子表格用户谱系：电子表格是"赋能型技术"，用户可自行存储、操纵、分析数据，但存在很宽的能力光谱；另有同组 WIP 论文研究"人们如何学会使用电子表格"。支持 5C 的论点：电子表格式交互的可学习性来自直接操作 + 可见反馈，而非公式语言本身。
Key quotes: "Spreadsheets are an empowering technology; users can store, manipulate, and analyse data for their own benefit. Yet there is a wide spectrum of spreadsheet [experience]."

**任务状态说明**：8 次 WebSearch + 5 次 WebFetch 预算已用尽；5 个页面成功抓取（Victor、Nardi、Potluck、Josh Flowers 全文；Onshape 博客仅获摘要）。未覆盖到的缺口：Grasshopper/Dynamo 交互设计一手资料、GitKraken/Fork/lazygit 深度分析、SolidWorks/Onshape driven vs driving 尺寸的官方文档、Blender 依赖图脏标记实现——建议主报告对 5B-git 可视化与 5C-约束子项标注"证据较弱/待补"。
