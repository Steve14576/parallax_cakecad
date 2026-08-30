# Subagent G 原始报告：引文核验（Phase 3.1）

> Deep Research | 2026-08-30 | 角色：Verification Agent | 预算：10/10 WebFetch（C10b gelatodemy 403 后降级浏览器核验）

## 核验表

| # | Claim (short) | Source | Rating | Notes |
|---|---|---|---|---|
| C1 | FDC API 公开可用、需 data.gov key、DEMO_KEY 30/h、CC0、端点齐全 | fdc.nal.usda.gov/api-guide | **SUPPORTED** | 页面写明 "Anyone may access and use the API"、须带 data.gov key、DEMO_KEY = 30 次/h/IP（另 50 次/天）、数据 "public domain… CC0 1.0 Universal"、端点表含 `/food/{fdcId}`, `/foods`, `/foods/list`, `/foods/search`。"免费"一词未出现于原文，但全文无收费记载。 |
| C2 | Choi-Okos 1986 由组成推密度/比热/导热；系数公开（Singh & Heldman）；有免费实现 | foodtechcalc.com | **SUPPORTED** | 页面标题即 "Food Physical Properties Estimator (Choi-Okos)"；"temperature-dependent polynomial equations for each pure component, then applies mixture rules"；引 Choi & Okos (1986) 与 Singh & Heldman 5th ed. Table A.2.9。小修正：该工具输入不含冰组分，若引"冰"应归原始论文。 |
| C3 | Baldwin 附录 C 转录 FDA 2009 肉类表与 FSIS 禽肉表；自算表用 Juneja 2001 的 D60=5.48 | douglasbaldwin.com/sous-vide.html | **SUPPORTED** | 逐字命中："C. Government Pasteurization Tables"、Table C.1 (FDA, 2009, 3-401.11.B.2) 130°F/112min→145°F/4min、Table C.2 FSIS 禽肉按脂肪分列、正文 "D60 = 5.48 minutes (Juneja et al., 2001)"。 |
| C4 | SuperPro：140+ 单元操作、衡算、调度、成本；覆盖食品；$15,950/$6,380 | intelligen.com superpro_overview | **SUPPORTED** | "Models for over 140 unit procedures / operations"、"Material and energy balances"、"Scheduling of batch operations"；行业列表含 Food；价格表 Purchase $15,950/copy, Lease $6,380/copy/year。 |
| C5 | manifold-3d：拓扑鲁棒网格布尔；npm 包为 WASM；OpenSCAD 已集成 | github.com/elalish/manifold | **SUPPORTED** | Repo 标语 "Geometry library for topological robustness"；"guaranteed-manifold mesh Boolean algorithm"；绑定表中 TS/JS = `manifold-3d`；"our npm package, manifold-3d, built via WASM"；集成列表首位 OpenSCAD（另有 Blender、Godot 等）。 |
| C6 | OCP/OpenCascade 经 Pyodide 编译为 WASM，build123d 完整跑在浏览器 | github.com/CadQuery/cadquery/discussions/1876 | **SUPPORTED** | yeicor（2025-07）原话："I've successfully compiled OpenCascade and the OCP Python wrapper to WebAssembly using Pyodide, enabling build123d to run entirely in the browser." 标题即 "OCP.wasm"。 |
| C7 | local-first 论文：七理想；Git 最接近；Git 把非文本当二进制；CRDT 历史累积的性能问题 | inkandswitch.com/essay/local-first | **SUPPORTED** | "Seven ideals for local-first software"；Git+GitHub "perhaps the closest thing…"；"other file formats are treated as binary blobs"；"CRDTs accumulate a large change history, which creates performance problems." |
| C8 | Potluck 的渐进富化：乱记录→按需加结构→每阶段都有用；灵感为电子表格 | inkandswitch.com/potluck/ | **SUPPORTED** | 近逐字："gradual enrichment: allowing users to record information in natural, messy ways, and then slowly adding formal structure and computational behavior only as needed"；"One inspiration for gradual enrichment is spreadsheets"；"At every point along the way, the artifact remained useful and grounded in real needs." |
| C9 | AE Responsive Design–Time 保护关键帧区域（淡入/淡出）不被拉伸重写 | helpx.adobe.com responsive-design | **SUPPORTED** | "adaptive time-stretching means that the protected regions animate in the same amount of time, even if you time-stretch the unprotected regions"；"You can protect the fade-in/out regions (comprising keyframes)…"；Intro/Outro/Work-area 保护区创建均有文档。 |
| C10 | gelato 付费平衡软件存在：Gelatodemy（PAC/POD/固形物/脂肪/糖）；icecreamcalc（PAC/POD/固形物，~18,271 配方） | gelatodemy.com; icecreamcalc.app | **SUPPORTED（带保留）** | Gelatodemy（经浏览器，WebFetch 403）："The software automatically calculates PAC, POD, percentage of solids, fats, sugars, and much more"，付费年费 €144→€97/12 月——完全支持。icecreamcalc KB 确认 PAC/POD/脂肪/总固形物平衡；配方页实时计数已达 18,392，故 18,271 是合理的历史快照。 |

## 修正与保留意见汇总

全部十条声明核验通过，无 UNSUPPORTED。三处精确性修正已应用到主报告：
1. **C1**——API 指南从未使用"免费"一词；更准确表述为"无记载收费的公开访问"，且 DEMO_KEY 另有 50 次/天上限。
2. **C2**——被引的 foodtechcalc 实现接受碳水/脂肪/蛋白/纤维/灰分/水分，但不含冰；若必须引用"冰"组分，应指向 Choi-Okos 原文 / Singh & Heldman Table A.2.9 而非该工具。
3. **C10**——配方数为实时浮动计数器（现 18,392），应写"约 1.8 万社区配方"；且 icecreamcalc.app 是 freemium（免费层 + 付费 Premium）而非纯付费——"付费品类"的举证责任由 Gelatodemy 单独承担。
无需删除任何引文。
