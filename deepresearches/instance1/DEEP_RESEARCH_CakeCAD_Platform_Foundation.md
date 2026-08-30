# Deep Research: CakeCAD 长线平台地基调研

> Generated 2026-08-30 | Depth: deep | Sources: 73

## TL;DR

CakeCAD 的四个地基假设全部经受住了检验：物性数据弹药库真实存在且分层清晰（成分层可全自动摄取，动力学层需半自动"论文→胶囊"管线）；"两端挤压出的中间空档"市场结构成立（消费端计算器确实在收费，工业端要 $16,000，厨房研发尺度无人占据）；技术路线上**参数化 B-Rep 主体 + SDF 涂层 + append-only 命令日志版本树**是被先例支撑的组合；核心交互（时间擦洗、草图态、锁定测量点、数值策略）每一个都能在 Bret Victor、Ink & Switch、After Effects、电子表格研究中找到已验证的出处。最优先的行动是把 USDA FDC + Choi-Okos + 官方巴氏杀菌表做成前三个"模型胶囊"，并尽快验证中间空档到底是"没人做"还是"没需求"。

## Executive Summary

这份调研服务于 CakeCAD 的**长线平台地基**——一个以时间为主轴的开放式物质过程 CAD/PLM，其哲学是"菜谱是跑在物质上的程序"、懒仿真（有证据才算、算必声明置信度）、"自由改，明确调和，局部求解"。四路并行检索加两轮补漏、共 73 个来源，结论如下：

**数据层**：USDA FoodData Central API 免费开放（CC0），配合 Choi-Okos 组成→热物性推导链，"从营养标签推导物理性质"是被同行评审文献验证过的真实管线 [1][2][3]；FAO/INFOODS 提供第二个可整库摄取的成分源 [10]。动力学参数（Arrhenius 活化能等）真实存在但散落论文 [5]；意外的好消息是官方巴氏杀菌时间-温度表完全免费可得（FDA/FSIS/PMO），是天然的 L0 查表胶囊 [73]-[76]。乳液类现象文献确认**无普适定量模型**，只能做带有效域的启发式规则 [77]-[79]——这恰好是证据阶梯设计的正确用例而非障碍。

**市场层**：付费配方仿真品类证据扎实——BeerSmith 20 年 210 万配方 [16]，gelato 平衡软件一个利基里站着多个收费厂商 [18]-[20]，ChefSteps 把分子料理计算器收进 $69/年付费墙 [89]。但所有现存产品都是"静态计算器"或工业巨兽（SuperPro $15,950/套 [26]）：无时间轴、无分支、无过程语义。LLM 时代消费端的 AI 菜谱全是文本生成大宗商品，不构成威胁 [80][81][87]；唯一贴边的工业类比是 NotCo Giuseppe [82]-[84] 和营销存疑的 iFactory [85]。

**技术层**：Ink & Switch 的 local-first 论文直接支持"命令日志 + 归一化 IR"而非文件 diff 的版本架构 [31][32]。几何内核应为混合体：B-Rep 做主体、SDF 做涂层（nTop 一手分析证明距离场天然是偏置语义 [44]）。Web/TS 与 Python 两大生态都可行：manifold-3d 是最可靠的浏览器 CSG [36][37]，CadQuery/build123d 是 Python 参数化事实标准且已被编译进浏览器（OCP.wasm [41]）。

**交互层**：草图态→调和被 Ink & Switch Potluck 的"渐进富化"实证为稳态工作流 [63]；时间擦洗三性质出自 Bret Victor [61]；锁定测量点的产品先例是 After Effects Responsive Design–Time [67]；刻意不做节点图的判断被 Houdini vs Blender 的教训反向验证 [71]。

最大的未解风险不在技术：**中间空档是否意味着需求不存在**，这只能用真实烘焙研发者验证回答。

---

## 1. 食品物性与动力学数据的摄取地图 [Confidence: High]

结论先行：CakeCAD 需要的数据弹药库真实存在，而且分层清晰——每一层的获取难度、自动化程度与置信度都不同，恰好对应证据阶梯的不同档位。

最底层是成分数据，这一层几乎完全免费且机器可读。USDA FoodData Central API 向任何人开放，只需一个 data.gov API key：DEMO_KEY 限 30 次/小时、50 次/天，正式 key 提到 1000 次/小时；核心端点 `/food/{fdcId}`、`/foods/list`、`/foods/search` 覆盖检索全链路，数据以 CC0 公有领域发布（官方文档未使用"免费"一词，但全文无任何收费记载），还提供 OpenAPI 规范 [1]，甚至已有开源 REST 封装 littlebunch/fdc-api 可直接复用 [11]。第二机器可读源是 FAO/INFOODS 的 BioFoodComp：6411 条食品条目、451 种成分，免费 Excel 下载 [10]。关键飞跃在于：从营养标签到物理性质不是幻想，而是一条被反复验证的推导链。Choi-Okos 模型用组成预测热物性，混合规则简单明确——密度按体积可加性 $\rho_{mix}=1/\Sigma(X_i/\rho_i)$、比热按质量加权、导热系数按体积分数加权，各组分性质用 $P(T)=A+BT+CT^2$ 多项式表达；foodtechcalc.com 已免费实现全套 [2]。这条链的学术背书扎实：JFS 2017 综述与 Purdue 的应用论文证明组成法热物性预测经过验证并已被用于热过程仿真 [3]；ASHRAE 制冷手册第 9 章给出权威的热扩散率表，并指出实测值稀缺、通常由 $k/(\rho \cdot c_p)$ 计算，未冻结食品典型区间 $1.0$–$1.8 \times 10^{-7}$ m²/s [4]。也就是说，给定 FDC 成分，CakeCAD 可以全自动推出密度、比热、导热系数——这一层应当做成完全自动摄取。

第二层是动力学与工艺参数，特征是"存在但散落于论文中"。Arrhenius 活化能 $E_a$ 需要逐篇提取：燕麦蛋白变性 480–575 kJ/mol、蛋清溶菌酶跨越 50–90°C、还有基于 DSC 的糊化 $E_a$ 方法；文献明确警告非 Arrhenius 展开行为，意味着每个动力学胶囊必须声明温度有效域 [5]。但这一层里有一类意外的好东西：官方巴氏杀菌表。Baldwin 低温慢煮指南附录 C 转录了 FDA Food Code 2009 表（130°F/112 分钟 → 145°F/4 分钟）与按脂肪含量分档的 FSIS 禽肉表，其自有表来自 Juneja 2001 的 D 值（牛肉中沙门氏菌 $D_{60}=5.48$ min），已核实 [73][74]；USDA FSIS 的 RTE 蛋制品合规指南附录同样带巴氏杀菌表 [75]；FDA Grade A PMO 规定 HTST 72°C/15s，且与 J. Dairy Sci. 2009 交叉印证 [76]。这些是免费的官方查找表，是天然的 L0 胶囊——置信度最高、无需建模、直接查表即用。

第三层是工艺经验层。冰淇淋界的 PAC（抗冻力）与 POD（相对甜度）系数完全公开、以蔗糖为基准 [6][7]；尤其值得注意的是 Scoopulator 已经把 USDA FDC 食材 ID（如 usdaff-746782）接入配方计算——成分→工艺模型的管线先例已经存在 [7]。起泡率（overrun）有定量文献支撑：Palsgaard 给出典型 overrun 约 100%（空气占体积 50%），并有 30 秒搅打时间的对比方法 [8]。

最后是负结果层：乳液没有通规定量模型，而这没关系。USDA ARS 对蛋黄酱稳定性的模糊建模是配方特异的数据驱动方法 [77]；Widerström & Öhman 的灾难性相转化研究给出的是实验测得的临界条件而非闭式公式 [78]；MDPI Foods 综述的结论更直白——稳定化是定性机制（亲水胶体成膜），稳定性靠测量而非预测来评估 [79]。正确做法是把它实现为带有效域声明的局部启发式规则（如油相体积分数对比密堆积极限 ≈0.74，叠加 HLB），这恰恰忠实于文献现状。Lucas-Washburn 毛细渗吸给出了"带有效域声明的胶囊"的范本：毛细/重力比 >3.0 才适用，纤维素溶胀会导致偏离 [9]。

对摄取架构的启示因此非常清楚：成分层全自动摄取；动力学与工艺层走半自动的"论文→胶囊"管线，每个胶囊自带有效域与置信度标签——这正是证据阶梯的物化。

## 2. 竞争格局——两端挤压出的中间空档 [Confidence: Medium-High]

市场呈现两端挤压的结构。一端是消费级配方计算器，它们确实收费：BeerSmith 运营 20 余年，一次买断、桌面+网页+移动端，托管 210 万份配方，能仿真 ABV、IBU、色度与水质化学，还有订阅制竞品 Brewfather [16][17]——家酿圈证明了"付费配方仿真"这一品类的真实存在。冰淇淋垂直赛道更拥挤：Gelatodemy 收费约 €97–144/年，口号是"Stop improvising"，计算 PAC/POD/固形物/脂肪/糖 [18]；icecreamcalc 走 freemium 路线、社区约 1.8 万份配方 [19]；还有 Scuola Gelato [20]——一个细分利基里站着多个独立供应商。而烘焙端只有烘焙百分比计算器，没有任何发酵或热仿真工具 [21]，这是离 CakeCAD 最近的空档。另一端是工业过程仿真：SuperPro Designer 提供 140+ 单元操作、质量/能量衡算、批次调度甘特图与成本核算，覆盖食品行业，单套售价 $15,950、租赁 $6,380（LT 简化版约 $1,000）[26][27]——它处理的是比厨房规模大三到四个数量级的对象。中间的研发厨房地带：空白。

最接近的先例逐个看。Cooklang 是开放配方标记语言，其官方博客直接教用户用 Git 对 .cook 文件做版本控制（diff/协作）[22]——"配方的 git"已有先例，但仅限版本化，没有过程与时间仿真。Cakenote 是最接近的"蛋糕设计软件"：2D/3D/AI 设计加实时成本核算与订单管理，但没有任何工艺仿真 [25]；它证明了"带成本的蛋糕设计"已存在，CakeCAD 的过程/时间轴依然是新的。学术谱系上，MIT Computational Food 把形变食品当作可编程物质研究 [23]，Bagler 的计算美食学主张"让食物可计算" [24]——学统纯正，但都没产品。iFactory 是最接近的单页产品：食品过程仿真+AI 配方+放大计算（传热/粘度/混合时间），还宣称"版本控制确保可追溯" [85]——但它只是营销页、数字未经核实，只能当竞争信号而非权威。厨房软件现有玩家全部只做财务与合规：SmartKitchen 的数字 HACCP（温度监控、付费许可——这恰好证明时间-温度历史追踪是付费需求）[28]、Galley 的航空配餐成本核算 [29]、Jelly 的食品成本工具 [15]，没有一个在仿真物理。

LLM 时代的格局需要冷静判断。消费端如 Samsung Food（前身 Whisk）把文本菜谱生成做成了大宗商品，没有过程语义，不构成威胁 [80][81]；市场报告显示菜谱生成 AI 市场从 $1.8B 涨到 $8.7B 的预测 [87]、AI 配方软件约 19.5% CAGR [86]，但 ACM 2025 的论文清一色是文本生成范式、无过程语义 [88]。唯一真正的工业类比是 NotCo 的 Giuseppe AI：B2B 端到端配方平台，把成本、风味、供应链的数千变量当作约束满足问题求解，已与 Kraft Heinz、Magnum 合作 [82][83][84]——它验证了"配方即约束满足程序"的哲学，但不触碰厨房尺度的过程时间轴。另一组佐证：ChefSteps 以 $69/年订阅存活，卖点含"370+ 指南、工具与计算器"，分子料理计算器如今被收进付费墙 [89]，被 Breville 收购救活后转型 [90]，而第三方低温慢煮计算器已商品化/免费 [92]；Modernist Cuisine 官网检索计算器结果为零（负发现）[91]。

综合判断：对投资人叙事而言，"这个品类有人付费"的证据是扎实的（BeerSmith、Gelatodemy、SmartKitchen、ChefSteps）；真正的风险从来不是撞上竞品，而是需求本身是否成立——中间空档目前没有直接先例 [置信度：中]。

## 3. 技术路线——几何内核、本地优先与两大生态 [Confidence: Medium-High]

架构骨干可以从 local-first 七理想直接推导：无需转圈、多设备、网络可选、无缝协作、Long Now 式长期存续、隐私、所有权 [31]。Ink & Switch 自己承认 Git 是最接近 local-first 的软件，但 Git 把非文本当二进制黑盒 [32]——这个观察直接支持 CakeCAD 走命令日志/IR 架构而非文件 diff。CRDT 的历史累积是已知性能问题 [32]，所以选型要诚实：Automerge 保留完整历史、语义最接近 git，但体积与速度偏重 [33]；Yjs 在大文档上快 10–50 倍，历史能力较弱，其作者 Kevin Tange 也承认 Yjs 更擅长大体量文本文档 [34][35]。对一个单机桌面 CAD 应用，手写的 append-only 命令日志（git 式内容寻址）可能已经够用；CRDT 只在跨设备/协作真正到来时才引入——届时若 git 式历史重要选 Automerge，否则选 Yjs [置信度：中]。

几何内核的决策矩阵应当是混合体：参数化 B-Rep 主体（旋转/拉伸/布尔）+ SDF 涂层/淋面表达层 + 最终网格供视口渲染与打印。理由来自 nTop CTO 的一手分析：B-Rep 的圆角、偏置、布尔"经常失败"，面数过万后系统性崩溃；而隐式表达"永不失败"、完全可自动化，且"距离场编码了立即偏置一个物体所需的全部信息"——升降等值面就是内外偏置，这正是涂层加厚/减薄的完美语义；有机形态被明确列为 B-Rep 的弱项 [44]。未检索到 SDF 用于食品建模的先例，这是缺口也是机会。Blender devtalk 上"一切皆节点+惰性求值"的讨论（"bevel 修改器和流体仿真没有区别"）与 CakeCAD 的惰性工艺 DAG 同构 [45]。

两大生态要如实比较。Web/TS 路线：manifold-3d（Apache-2.0）拓扑鲁棒的网格布尔，npm WASM 包"互操作性难以匹敌"，被 OpenSCAD/OCADml/Space 集成，厂商宣称比旧 CSG 快约 1000 倍 [36][37]——但它是 CSG/网格，没有 B-Rep 特征树（"快千倍"为厂商自述 [置信度：中]）。opencascade.js 把完整 B-Rep 带进浏览器且已产品化（ocjs.org、occt-import-js）[38]，但痛点真实：即使在 Node 环境 TransferRoots 也非常慢，WASM+绑定开销在重操作上不可忽视 [39]。桌面壳用 Tauri：3–10MB 对比 Electron 的 120–200MB，内存省约 50–60%，代价是系统 WebView 的一致性风险 [40]。Python 路线：build123d 是基于 OpenCascade 的参数化 BREP 框架，API 干净完整；CadQuery 是成熟的链式 API 兄弟，二者共享 OCP 封装与 r/cadquery 生态 [42][43]——走 Python 等于走 OCCT 且白拿特征树语义。OCP.wasm（CadQuery 讨论 #1876，2025 年 7 月）证明 OpenCascade 可经 Pyodide 编译进浏览器、build123d 能完整跑在浏览器里 [41]——但载荷与启动成本决定了它只适合预览路径，不适合主交互路径。

裁决：生态之争的真正问题是"特征树与 DAG 执行器住在哪一层"。两条路都可行；推荐依据最终应用跑在哪里来定——若主战场是浏览器分发选 Web/TS（manifold + Three.js + Tauri 壳），若主战场是桌面个人软件选 Python（build123d + PySide6/pywebview）。Python 路线提供最丰富的参数化 CAD 生态、与作者既有 Python 工具链直接衔接，且 OCP.wasm 保留了未来进浏览器的逃生门。

## 4. 交互先例——草图态、时间擦洗与数值策略都有出处 [Confidence: High]

CakeCAD 的每一个核心交互都能在已验证的先例中找到出处，这不是巧合，而是因为这些问题在人机交互史上被反复解过。

特征树的痛点有一手证词：15 年经验的工业设计师 Josh Flowers 直言 SolidWorks/Onshape 的"缓慢重建与爱坏的特征树"，并高度评价 Fusion 360 的"不捕获设计历史"逃生口——在流动设计中丢弃特征树是深刻的省力器 [64]。Onshape 官方博客的 Repair Manager 更系统：基于历史的 CAD 必然需要特征修复，提供批量修复 UX，Rollback Bar 可跳回模型历史任意点，版本/分支即 CAD 里的 git [65]。从业者社区也明确区分"特征树"（树状）与"时间线"（线性、可擦洗指针）是两种不同心智模型 [66]。反方观点同样要记录：SourceCAD 认为特征树的组织可预期性正是其留存用户的原因 [68]。对 CakeCAD 的教训是三条：重建速度是硬指标；显式修复流程必须是一等公民；"历史可以被扔掉"必须是安全阀而非失败。

时间擦洗的理论基础来自 Bret Victor 的 Learnable Programming：用滑块擦洗执行过程，把时间"压扁"，让过程与轨迹成为同一事物的两种表示，使时间变得可把握、可见、可比较 [61]——这是时间线交互的三大性质。数值策略上，Fixed/Derived/Free/Targeted 的谱系直接继承电子表格：Nardi & Miller 指出电子表格的成功在于具体可见的数据与即时反馈压缩了"测试-评估-调试"循环，公式是隐式控制流，改一个单元格引发级联传播，用户直觉地信任这种传播 [62]；Sarkar 等 CHI 2020 进一步证明这种直接操纵+可见反馈正是可学习性的来源，覆盖广泛经验水平的用户 [72]。

最强的验证来自 Ink & Switch 的 Potluck：渐进富化（gradual enrichment）——先乱糟糟地记录，按需逐步添加结构与计算，工件在每一个阶段都有用；动态注解叠加在源上而不破坏原件 [63]。这与"草图态→刻意调和"完全同构：I&S 已经实证了文档在半一致状态下依然有用，草图态不是临时妥协而是稳态。锁定测量点的产品先例是 Adobe After Effects 的 Responsive Design–Time：拉伸时长时保护关键帧区域（淡入/淡出）不被重写 [67]——锁定点+局部重解的组合已经被千万用户验证。

最后是刻意不做节点图的判断依据。节点编辑器生态确实成熟（awesome-node-based-uis、LiteGraph/React Flow/Rete），从零做接线/端口/命中检测/性能极贵 [69][70]——但这不是不做的理由；真正的理由是 Houdini 与 Blender 的对比：Houdini 全节点表达力最强但"上手到产出的时间更长"，Blender 修改器优先、节点可选，门槛显著更低，从业者普遍认可"把参数化能力藏在熟悉的直接操作之下" [71]。CakeCAD 选择 Blender 路线：参数化力量全部保留，但露出水面的永远是直接操纵。

## 5. Action Plan

- [ ] **注册 data.gov API key，搭 FDC 摄取原型**：用 littlebunch/fdc-api 或直连 REST，为 100 种常用烘焙食材落库成分数据（本地文件起步）[1][11]
- [ ] **实现第一个真正的"模型胶囊"：Choi-Okos**（成分→密度/比热/导热，含冰组分，出处引 Choi & Okos 1986 与 Singh & Heldman Table A.2.9），并把胶囊 schema 定稿：有效域、来源、证据等级、`path_dependent`、`outcome_type` [2][3]
- [ ] **把官方巴氏杀菌表摄为 L0 查表胶囊**：Baldwin 附录 C（FDA/FSIS 两表）[73][74]、手动下载 FSIS RTE 蛋制品 PDF 补数值 [75]、FDA PMO HTST 72°C/15s [76]
- [ ] **写版本树架构决策记录（ADR）**：append-only 命令日志 + 内容寻址，明确"暂不引入 CRDT、引入时选 Automerge 的条件" [31]-[35]
- [ ] **几何内核双轨 spike**：manifold-3d（浏览器）与 build123d（Python）各做"旋转体+拉伸+布尔+一层偏移涂层"，量化重建延迟与开发手感 [36][42]
- [ ] **SDF 涂层实验**：用符号距离场表达淋面/涂层，等值面偏移=加厚减薄，Marching Cubes 出网格；确认"无先例"后它就是差异化点 [44]
- [ ] **时间轴交互原型**：scrubber + Bret Victor 式"压扁时间"叠加显示；锁定测量点按 AE 保护区模型设计 [61][67]
- [ ] **乳化胶囊按负结果写**：局部启发式规则（油相体积分数对密堆积 ≈0.74 + HLB），显式声明"无普适模型、仅配方邻域有效" [77]-[79]
- [ ] **建竞品监视清单**：iFactory、Cakenote、Cooklang、NotCo Giuseppe、Gelatodemy，季度复查一次 [25][26][82][85]
- [ ] **需求验证（最高优先级）**：找 3-5 个法甜/entremet 研发者，验证"中间空档"是真需求还是无需求——这是本报告唯一无法用检索回答的问题

## 6. Open Questions & Caveats

1. **空档 ≠ 需求**。中间层没有先例，可能有两种解释：没人想到，或者没人要。检索无法区分，只能用真人验证回答。这是整个平台最大的单点风险。
2. **Choi-Okos 对复杂烘焙品的精度存疑**。组成法假设组分独立可加，对多孔、多相、含气结构的蛋糕胚可能系统性偏差；落地时应允许降为 L1 并支持实测校准回填。
3. **两份权威表的具体数值未抓到**：FSIS RTE 蛋制品合规指南（403）与联邦注册表（反爬验证码），存在与表头已确认，需手动下载补齐。
4. **一手架构资料的空白**：Blender/Figma 的命令与 undo 实现没有高质量公开讲稿；Grasshopper/Dynamo 交互设计、Git 可视化工具深度分析也未覆盖。后续可读源码或找会议录像补。
5. **厂商自述需折扣**：manifold"快约 1000 倍"是团队自述 [37]；iFactory 全部数字为营销话术 [85]。本报告已相应降级。
6. **Tauri 的系统 WebView 一致性风险**在 Windows/Linux/macOS 三端未实测 [40]；本地优先桌面应用若吃 3D 视口重活，需早期验证。
7. **SDF 食品建模无先例**意味着我们会是第一个——既是机会也意味着没有现成参数与教训可抄。
8. **市场报告的预测数字**（19.5% CAGR、$1.8B→$8.7B）来自市场研究聚合商，仅作方向性参考 [86][87]。

## Methodology

- **深度**：deep。Wave 1 四个并行检索子代理（数据源 / 竞品 / 架构+内核 / 交互），Wave 2 两个定向补漏代理（巴氏杀菌与乳化 / LLM 时代创业公司与分子料理工具），随后 1 个引文核验代理、1 个综合起草代理。
- **来源**：73 个。编号保留各代理的 START_INDEX 分配区间（[1]-[11]、[15]-[30]、[31]-[45]、[61]-[72]、[73]-[79]、[80]-[92]），区间内的空号是未用分配，非遗漏；所有被引用的编号在 Bibliography 中均有定义。合并时发现一处撞号（竞品代理的 Jelly 与架构代理的 local-first 论文同被编为 [31]），已将 Jelly 重分配为 [15]，其余编号无冲突。
- **引文核验**：抽查 10 条最高影响声明，10/10 SUPPORTED。三处措辞修正已应用：①FDC API 表述为"无记载收费的公开访问"而非"免费"，并补记 DEMO_KEY 的 50 次/天上限；②Choi-Okos 的 ice 组分出处归原始论文/教材而非 foodtechcalc 工具（该工具输入不含冰）；③icecreamcalc 配方数为浮动计数器（约 1.8 万），且其为 freemium 而非纯付费。
- **大纲调整（Phase 3.5）**：证据与原计划的五个关键区域全部吻合；将通用的"现状/趋势/批判"三段骨架替换为按证据组织的四个主题章节（数据地图/竞争格局/技术路线/交互先例），骨架其余部分（TL;DR、执行摘要、行动计划、开放问题、方法论、参考文献、摘录）保留。结构改动幅度约 40%。
- **降级说明**：若干页面抓取失败，对应来源基于搜索引擎摘要并已标注——Gelatodemy（403，后经浏览器核验）、MIT Media Lab（超时）、FSIS 蛋制品指南（403）、联邦注册页（验证码）、Onshape 博客（JS 渲染仅得摘要）、Yjs issue #145（超时）。

## Bibliography

[1] USDA ARS — FoodData Central API Guide — https://fdc.nal.usda.gov/api-guide — 2026-08-30 — Tier: 1
[2] FoodTech Calc — Food Physical Properties Estimator (Choi-Okos) — https://www.foodtechcalc.com/thermal/physical_properties_estimation/food-physical-properties-estimator — 2026-08-30 — Tier: 2
[3] Muniandy et al. — Composition-Based Prediction of Temperature-Dependent Thermal Properties (JFS 2017, doi:10.1111/1750-3841.13564) + Purdue 应用论文 — https://ift.onlinelibrary.wiley.com/doi/10.1111/1750-3841.13564 — 2026-08-30 — Tier: 1 [foundational]
[4] ASHRAE — Thermal Properties of Foods (Handbook—Refrigeration, Ch. 9) — https://www.researchgate.net/file.PostFileLoader.html?id=57dc0df6dc332d6c7a2b0e94 — 2026-08-30 — Tier: 1 [foundational]
[5] PubMed/TUM/MDPI 文献组 — 蛋白变性与淀粉糊化动力学多篇 — https://pubmed.ncbi.nlm.nih.gov/16232451/ — 2026-08-30 — Tier: 1
[6] Gelatologist — What PAC Is, and How to Calculate It — https://medium.com/@gelatologist/what-pac-is-and-how-to-calculate-it-2f1ade1bd5df — 2026-08-30 — Tier: 3
[7] Scoopulator — Ice Cream Calculator — https://scoopulator.app/calc — 2026-08-30 — Tier: 2
[8] Soukoulis et al. — Ice Cream: Foam Formation and Stabilization—A Review (Food Reviews International) — https://www.tandfonline.com/doi/full/10.1080/87559120903564472 — 2026-08-30 — Tier: 1
[9] Li et al. — Criteria for Applying the Lucas-Washburn Law (Sci. Rep. 2015) — https://pmc.ncbi.nlm.nih.gov/articles/PMC4568521/ — 2026-08-30 — Tier: 1
[10] FAO/INFOODS — BioFoodComp / Analytical Food Composition Database — https://openknowledge.fao.org/handle/20.500.14283/i7364en — 2026-08-30 — Tier: 1
[11] littlebunch — fdc-api — https://github.com/littlebunch/fdc-api — 2026-08-30 — Tier: 2
[15] Jelly — Food Costing & Kitchen Management Software — https://www.getjelly.co.uk/ — 2026-08-30 — Tier: 2
[16] BeerSmith Inc. — BeerSmith Home Brewing Software — https://beersmith.com/ — 2026-08-30 — Tier: 2
[17] r/Homebrewing — What brewing software do you guys use? — https://www.reddit.com/r/Homebrewing/comments/lh4541/what_brewing_software_do_you_guys_use/ — 2026-08-30 — Tier: 3
[18] Gelatodemy — Gelato Balancing Software — https://gelatodemy.com/en/ice-cream-balancing-software/ — 2026-08-30 — Tier: 2
[19] icecreamcalc.app — Gelato & Ice Cream Calculator KB — https://www.icecreamcalc.app/kb/introduction — 2026-08-30 — Tier: 2
[20] Scuola Gelato — Gelato Naturale Balancing Software — https://www.scuolagelato.it/en/gelato-naturale-balancing-software/ — 2026-08-30 — Tier: 2
[21] Bakerspercentagecalc.com — Baker's Percentage Calculator — https://bakerspercentagecalc.com/ — 2026-08-30 — Tier: 3
[22] Cooklang — Version Control Your Recipes with Git — https://cooklang.org/blog/43-version-control-recipes-with-git/ — 2026-08-30 — Tier: 2
[23] MIT Media Lab — Computational Food — https://www.media.mit.edu/projects/computational-food/overview/ — 2026-08-30 — Tier: 1
[24] Bagler et al. — Computational Gastronomy — https://computationalgastronomy.org/ — 2026-08-30 — Tier: 1/2
[25] Cakenote — Cake Design, Costing & Business Software — https://app.cakenote.com/ — 2026-08-30 — Tier: 2
[26] Intelligen Inc. — SuperPro Designer Overview — https://www.intelligen.com/static/superpro_overview.html — 2026-08-30 — Tier: 1
[27] ISEKI-Food Network — Course on Batch/Bio Process Modeling — https://www.iseki-food.net/events/course-batch-bio-process-modeling-cost-goods-analysis-production-planning-scheduling-and-0 — 2026-08-30 — Tier: 2
[28] SmartKitchen — Digital HACCP products and licenses — https://smartkitchen.solutions/en/digital-haccp-commercial-kitchen/digital-haccp-products-and-licenses/ — 2026-08-30 — Tier: 2
[29] IFCS — Galley XAI Aviation Catering Software — https://ifcs.aero/galleyx/aviation-catering-food-costing/ — 2026-08-30 — Tier: 2
[30] Quantz — The Protocol of Taste — https://www.quantz.top/posts/the-protocol-of-taste-quantifying-culinary-process-through-distributed-systems — 2026-08-30 — Tier: 3
[31] Kleppmann et al. (Ink & Switch) — Local-first software essay — https://www.inkandswitch.com/essay/local-first/ — 2026-08-30 — Tier: 1 [foundational]
[32] Kleppmann et al. — Local-first software (Onward! 2019, ACM) — https://dl.acm.org/doi/10.1145/3359591.3359737 — 2026-08-30 — Tier: 1 [foundational]
[33] HN — Automerge vs Yjs discussion — https://news.ycombinator.com/item?id=41012895 — 2026-08-30 — Tier: 3
[34] PkgPulse — Yjs vs Automerge vs Loro: CRDT Libraries 2026 — https://www.pkgpulse.com/guides/yjs-vs-automerge-vs-loro-crdt-libraries-2026 — 2026-08-30 — Tier: 3
[35] Kevin Tange — yjs/yjs Issue #145 [snippet only] — https://github.com/yjs/yjs/issues/145 — 2026-08-30 — Tier: 2
[36] Lalish et al. — elalish/manifold README — https://github.com/elalish/manifold — 2026-08-30 — Tier: 2
[37] Babylon.js forum — manifold integration (厂商自述) — https://forum.babylonjs.com/t/is-there-a-roadmap-to-enhance-the-csg-operations/52978 — 2026-08-30 — Tier: 2
[38] OpenCascade.js 官方站 — https://ocjs.org/ — 2026-08-30 — Tier: 1
[39] OCCT3D forum — opencascade.js TransferRoots slow — https://occt3d.com/dev/content/opencascadejs-nodejs-transferroots-very-slow-need-optimized-way-get-bounding-box-faces/ — 2026-08-30 — Tier: 3
[40] Rustify — Tauri vs Electron for Desktop Apps in 2026 — https://rustify.rs/articles/rust-tauri-vs-electron-2026 — 2026-08-30 — Tier: 3
[41] CadQuery discussions #1876 — OCP.wasm: OpenCascade in WebAssembly — https://github.com/CadQuery/cadquery/discussions/1876 — 2026-08-30 — Tier: 2
[42] build123d 官方文档 — https://build123d.readthedocs.io/en/v0.10.0/ — 2026-08-30 — Tier: 1
[43] grandpacad.com — OpenSCAD vs CadQuery vs Build123d — https://grandpacad.com/en/blog/openscad-vs-cadquery-vs-build123d — 2026-08-30 — Tier: 3
[44] Blake Courter (nTop) — B-rep vs. implicit modeling — https://www.ntop.com/resources/blog/understanding-the-basics-of-b-reps-and-implicits/ — 2026-08-30 — Tier: 2
[45] Blender devtalk — Blender's architecture concerning everything nodes — https://devtalk.blender.org/t/blenders-architecture-concerning-everything-nodes/9888 — 2026-08-30 — Tier: 3
[61] Bret Victor — Learnable Programming — https://worrydream.com/LearnableProgramming/ — 2026-08-30 — Tier: 1 [foundational]
[62] Nardi & Miller — The spreadsheet interface (HP Labs) — https://www.miramontes.com/writing/spreadsheet-eup/ — 2026-08-30 — Tier: 1 [foundational]
[63] Ink & Switch — Potluck: Dynamic documents as personal software — https://www.inkandswitch.com/potluck/ — 2026-08-30 — Tier: 1
[64] Josh Flowers — Fusion 360 vs Solidworks vs NX vs Onshape — https://www.joshflowers.xyz/blog/solidworks-vs-siemens-nx-vs-onshape-vs-fusion360 — 2026-08-30 — Tier: 3
[65] Onshape blog — Tackling History-Based Errors (Repair Manager) [snippet only] — https://www.onshape.com/en/blog/tackling-history-based-errors-parametric-cad-repair-manager — 2026-08-30 — Tier: 1
[66] r/SolidWorks — Fusion 360 timeline comparison — https://www.reddit.com/r/SolidWorks/comments/1kql8ba/ — 2026-08-30 — Tier: 3
[67] Adobe — After Effects Responsive Design–Time — https://helpx.adobe.com/after-effects/desktop/motion-graphics/add-responsive-design/responsive-design.html — 2026-08-30 — Tier: 1
[68] SourceCAD — SolidWorks vs Fusion 360 — https://sourcecad.com/blog/solidworks-vs-fusion-360-which-one-should-you-learn — 2026-08-30 — Tier: 3
[69] xyflow — awesome-node-based-uis — https://github.com/xyflow/awesome-node-based-uis — 2026-08-30 — Tier: 2
[70] r/node — Choosing graph editor — https://www.reddit.com/r/node/comments/10o43dg/choosing_graph_editor/ — 2026-08-30 — Tier: 3
[71] Artivoxa — Houdini vs Blender: Procedural 3D Compared — https://www.artivoxa.com/houdini-vs-blender-procedural-3d-compared/ — 2026-08-30 — Tier: 3
[72] Sarkar et al. — Spreadsheet Use and Programming Experience (CHI 2020) — https://dl.acm.org/doi/fullHtml/10.1145/3334480.3382807 — 2026-08-30 — Tier: 1
[73] Douglas Baldwin — A Practical Guide to Sous Vide Cooking — https://douglasbaldwin.com/sous-vide.html — 2026-08-30 — Tier: 2
[74] FDA — Food Code 2009 §3-401.11.B.2（经 Baldwin Table C.1 转录）— 同 [73] — 2026-08-30 — Tier: 1
[75] USDA FSIS — Compliance Guide for RTE Egg Products（附录含巴氏杀菌表；抓取 403）— https://www.fsis.usda.gov/sites/default/files/import/Compliance_Guide_RTE_egg_products.pdf — 2026-08-30 — Tier: 1
[76] FDA — Grade "A" Pasteurized Milk Ordinance (PMO 2025) — https://www.fda.gov/media/193438/download — 2026-08-30 — Tier: 1
[77] USDA ARS — Formulation and fuzzy modeling of mayonnaise emulsion stability (2008) — https://www.ars.usda.gov/ARSUserFiles/30200510/2008%20-%20Formulation%20and%20Fuzzy%20Modeling%20-%20Mayonnaise.pdf — 2026-08-30 — Tier: 1
[78] Widerström & Öhman — Mayonnaise: Quality and Catastrophic Phase Inversion — https://www.semanticscholar.org/paper/d72e3744d396093c79f345cedc212a7ec5aa6e6b — 2026-08-30 — Tier: 1
[79] Foods (MDPI) — Mayonnaise main ingredients influence on its structure — https://pmc.ncbi.nlm.nih.gov/articles/PMC9114219/ — 2026-08-30 — Tier: 1
[80] TechCrunch — Samsung launches Samsung Food — https://techcrunch.com/2023/08/30/samsung-launches-a-meal-planning-and-recipe-discovery-platform-called-samsung-food/ — 2026-08-30 — Tier: 2
[81] Samsung Newsroom — Samsung Food global launch — https://news.samsung.com/global/samsung-announces-global-launch-of-samsung-food-an-ai-powered-personalized-food-and-recipe-service — 2026-08-30 — Tier: 2
[82] Green Queen — Inside NotCo's AI-Driven Food Revolution — https://www.greenqueen.com.hk/notco-ai-giuseppe-food-tech-kraft-heinz-not-company/ — 2026-08-30 — Tier: 2
[83] Oxford Academic FST — Inside the data-driven revolution — https://academic.oup.com/fst/article/39/4/32/8382822 — 2026-08-30 — Tier: 1
[84] Magnum Ice Cream Company — partners with NotCo AI — https://news.magnumicecream.com/the-magnum-ice-cream-company-partners-with-notco-ai/ — 2026-08-30 — Tier: 2
[85] iFactory — Food Process Simulation page（营销页，数字未核实）— https://ifactoryapp.com/industries/food-manufacturing/food-process-simulation-recipe-formulation-ai-scaling — 2026-08-30 — Tier: 2
[86] Future Market Insights — AI-Enabled Food Formulation & R&D Software Market — https://www.futuremarketinsights.com/reports/ai-enabled-food-formulation-and-r-and-d-software-market — 2026-08-30 — Tier: 3
[87] Dataintelo — Recipe Generation AI Market — https://dataintelo.com/report/recipe-generation-ai-market — 2026-08-30 — Tier: 3
[88] ACM — An LLM-Based Interactive System for Personalized Recipe Generation (2025) — https://dl.acm.org/doi/10.1145/3746027.3754489 — 2026-08-30 — Tier: 1
[89] ChefSteps 官网 — https://www.chefsteps.com/ — 2026-08-30 — Tier: 2
[90] r/sousvide — ChefSteps paywall/Breville acquisition — https://www.reddit.com/r/sousvide/comments/ims4b0/ — 2026-08-30 — Tier: 3
[91] Modernist Cuisine 官网搜索 "calculator"（负结果）— https://modernistcuisine.com/?s=calculator — 2026-08-30 — Tier: 2
[92] sousvidetools.com — Sous Vide Cooking Time Calculator — https://www.sousvidetools.com/sous-vide-cooking-time-calculator — 2026-08-30 — Tier: 3

## Source Extracts

> 子代理返回的原始数据存档，供后续会话直接复用，无需重新抓取。

### [1] USDA FDC API Guide
- **Summary:** 任何人可访问；须带 data.gov API key（DEMO_KEY 30 次/h、50 次/天；正式 key 1000 次/h）；端点 `/food/{fdcId}`、`/foods`、`/foods/list`、`/foods/search`；数据 CC0；有 OpenAPI v3 规范。
- **Key quotes:** "Anyone may access and use the API"; "published under CC0 1.0 Universal".
- **Source type:** 官方文档 | **Tier:** 1

### [2] FoodTech Calc (Choi-Okos 实现)
- **Summary:** 免费在线实现：输入组成 → 任意温度下密度/比热/导热。混合规则与系数出处（Choi & Okos 1986；Singh & Heldman 5th ed. Table A.2.9；Sahin & Sumnu 2006）均明示；另含 Siebel 比热式。
- **Key quotes:** "ρ_mix = 1/Σ(Xᵢ/ρᵢ)"; "P(T) = A + B·T + C·T²".
- **Source type:** 行业工具 | **Tier:** 2

### [3] JFS 2017 综述 + Purdue 应用论文
- **Summary:** 同行评审验证组成法热物性预测；Purdue 用 TPCell/Choi-Okos/KD2 Pro 三法对比 25°C/120°C 导热，用于热过程仿真与配方选择。
- **Source type:** 学术 | **Tier:** 1

### [4] ASHRAE Handbook—Refrigeration Ch.9
- **Summary:** 权威热物性表（含热扩散率表，mm²/s）；实测值稀缺，通常由 k/(ρ·cp) 计算；未冻结食品典型 1.0–1.8×10⁻⁷ m²/s。
- **Source type:** 行业手册 | **Tier:** 1

### [5] 动力学文献组（PubMed/TUM/MDPI）
- **Summary:** Ea 数据分散：燕麦蛋白 480–575 kJ/mol；蛋清溶菌酶 50–90°C；DSC 法测糊化 Ea；存在非 Arrhenius 警告 → 胶囊须声明温度有效域。
- **Source type:** 学术 | **Tier:** 1

### [6] Gelatologist (PAC 教程)
- **Summary:** 以蔗糖为基准的 PAC 计算教程；同系工具：icecreamcalc、dairyscience.info、GameBob。gelato 行业系数完全公开。
- **Source type:** 从业者博客 | **Tier:** 3

### [7] Scoopulator
- **Summary:** 冰淇淋计算器按冰点降低与含水量估算硬度；配料库直接引用 USDA FDC 条目（usdaff-746782 等）——成分→工艺管线的现成先例。
- **Source type:** 行业工具 | **Tier:** 2

### [8] Soukoulis et al. (overrun 综述)
- **Summary:** 定量讨论搅打时间与蛋白类型对 overrun 的影响；配套行业值：典型 overrun ~100%（空气占体积 50%）。
- **Source type:** 学术 | **Tier:** 1

### [9] Lucas-Washburn 适用判据 (Sci. Rep. 2015)
- **Summary:** 毛细/重力比数 >3.0 时 √t 律成立；纤维素溶胀、墨水-纸界面等情形偏离——"带有效域声明的胶囊"的科学范本。
- **Key quotes:** "Lucas-Washburn's law applies when [Ncg] > 3.0".
- **Source type:** 学术 | **Tier:** 1

### [10] FAO/INFOODS BioFoodComp
- **Summary:** 全球分析型食品成分库，免费 Excel 整库下载；6411 食品条目、451 种组分。
- **Source type:** 国际组织数据库 | **Tier:** 1

### [11] littlebunch/fdc-api
- **Summary:** 开源 REST 封装，可浏览/搜索/查询 FDC 各数据源——摄取层的现成第三方生态。
- **Source type:** 开源项目 | **Tier:** 2

### [15] Jelly
- **Summary:** 英国餐饮厨房成本管理：自动处理供应商发票、实时维护食材成本/配方/毛利——专业厨房软件=财务与库存，无过程仿真的又一例证。
- **Source type:** 产品官网 | **Tier:** 2

### [16] BeerSmith
- **Summary:** BeerSmith 4 已发布；桌面买断+Web+移动；210 万托管配方；可按设备缩放配方；20+ 年经营史。
- **Source type:** 产品官网 | **Tier:** 2

### [17] r/Homebrewing 软件选型帖
- **Summary:** 社区首选 Brewfather（云/订阅、UI 好）与 BeerSmith（高级功能）；家酿配方模拟是多个产品长期竞争的付费市场。
- **Source type:** 社区 | **Tier:** 3

### [18] Gelatodemy
- **Summary:** 付费平衡软件（约 €97–144/年）：自动算 PAC/POD/固形物/脂肪/糖；"Stop improvising"。
- **Source type:** 产品官网 | **Tier:** 2

### [19] icecreamcalc.app
- **Summary:** freemium 专业计算器：PAC/POD/固形物/混合料平衡；社区配方约 1.8 万份（浮动计数）。
- **Source type:** 产品官网 | **Tier:** 2

### [20] Scuola Gelato
- **Summary:** 冰淇淋学校出品的付费平衡软件，主打 PAC——同一利基多厂商并存的又一证据。
- **Source type:** 产品官网 | **Tier:** 2

### [21] bakerspercentagecalc.com
- **Summary:** 烘焙端工具止步于百分比换算与缩放；未发现发酵/热过程模拟工具。
- **Source type:** 工具站 | **Tier:** 3

### [22] Cooklang (git for recipes)
- **Summary:** 开源配方标记语言；官方博客教用 Git 管理 .cook 文件（diff、协作）——版本化先例，无过程仿真。
- **Source type:** 开源项目博客 | **Tier:** 2

### [23] MIT Computational Food
- **Summary:** 把食物当可编程/形变介质的实验项目；学术探索，无产品。[摘要来源：页面抓取超时]
- **Source type:** 学术 | **Tier:** 1

### [24] Computational Gastronomy (Bagler)
- **Summary:** "让食物可计算"的多学科领域定义与研究网络（风味网络等）。
- **Source type:** 学术 | **Tier:** 1/2

### [25] Cakenote
- **Summary:** 2D/3D/AI 蛋糕设计 + 实时成本/建议售价 + 订单管理；无工艺过程模拟——最接近但正交的现存产品。
- **Source type:** 产品官网 | **Tier:** 2

### [26] SuperPro Designer Overview
- **Summary:** 140+ 单元操作；物料/能量衡算；批次调度；工艺经济学；用户覆盖食品/消费品；$15,950 买断 / $6,380 租赁每拷贝。
- **Key quotes:** "Models for over 140 unit procedures"; "Purchase…15,950 / Lease…6,380".
- **Source type:** 官方产品文档 | **Tier:** 1

### [27] ISEKI-Food 课程页
- **Summary:** SuperPro LT $1,000、SchedulePro LT $900——工业仿真"轻量版"价格锚点。
- **Source type:** 学术网络 | **Tier:** 2

### [28] SmartKitchen
- **Summary:** 数字 HACCP：温度监测、留样、报警、云报表，按许可收费——时间-温度历史追踪是付费刚需的证据。
- **Source type:** 产品官网 | **Tier:** 2

### [29] Galley XAI (IFCS)
- **Summary:** 航空配餐的配方级成本与生产排程；专业厨房软件=财务/排程，无物理仿真。
- **Source type:** 产品官网 | **Tier:** 2

### [30] The Protocol of Taste
- **Summary:** 用分布式系统类比烹饪；明确提出"配方版本控制/回滚 ≈ git for recipes"——概念在独立开发者圈自发出现的证据。
- **Source type:** 个人博客 | **Tier:** 3

### [31] Ink & Switch — local-first essay
- **Summary:** 七理想（即时、多设备、网络可选、协作、Long Now、隐私、所有权）；Git 是最接近的 local-first 软件但把非文本当二进制黑盒；CRDT 历史累积造成性能问题；React reducer 模式契合 CRDT。
- **Key quotes:** "the closest thing we have to a true local-first software package"; "CRDTs accumulate a large change history, which creates performance problems".
- **Source type:** 研究机构 | **Tier:** 1

### [32] Local-first (Onward! 2019)
- **Summary:** [31] 的同行评审版，正式引用出处。
- **Source type:** 学术 | **Tier:** 1

### [33] HN: Automerge vs Yjs
- **Summary:** Automerge 存完整历史（删除项永久保留）→ 天然版本语义但重；Yjs 轻、社区采用率更高。
- **Source type:** 社区 | **Tier:** 3

### [34] PkgPulse CRDT 对比 2026
- **Summary:** Yjs 采用最广；Automerge ~85K 周下载、擅长文档级版本；Loro 基准最快；第三方基准称大文档下 Yjs 快 10–50 倍。
- **Source type:** 技术媒体 | **Tier:** 3

### [35] Yjs issue #145 (Kevin Tange)
- **Summary:** Yjs 作者第一方：大体量文本/富文本文档场景 Yjs 更优。[摘要来源：抓取超时]
- **Source type:** 维护者声明 | **Tier:** 2

### [36] elalish/manifold README
- **Summary:** 定位"拓扑鲁棒性几何库"；保证流形的网格布尔；npm 包 manifold-3d 即 WASM 构建，"互操作性难以匹敌"；多语言绑定齐全。
- **Source type:** 开源项目 | **Tier:** 2

### [37] Babylon.js forum (manifold 集成)
- **Summary:** manifold 团队自述被 OpenSCAD/OCADml/Space 集成，理由是可靠性与速度（"快约 1000 倍"为厂商自述，需折扣）。
- **Source type:** 论坛/厂商 | **Tier:** 2

### [38] ocjs.org (opencascade.js)
- **Summary:** 完整 OCCT 移植到 JS/WASM；occt-import-js 为轻量只读 STEP 导入；浏览器/云端 CAD 已产品化。
- **Source type:** 官方项目 | **Tier:** 1

### [39] OCCT3D forum 痛点帖
- **Summary:** opencascade.js 在 Node 里读单零件 STEP 的 TransferRoots 都非常慢——重几何操作的 WASM+绑定开销真实存在。
- **Source type:** 社区 | **Tier:** 3

### [40] Rustify: Tauri vs Electron 2026
- **Summary:** 包体 3–10MB vs 120–200MB（20–50 倍）；Tauri 内存约省 50–60%；Tauri 用系统 WebView 有一致性风险。
- **Source type:** 技术博客 | **Tier:** 3

### [41] CadQuery discussions #1876 (OCP.wasm)
- **Summary:** OpenCascade + OCP 经 Pyodide 编译为 WASM，build123d 完整跑在浏览器——2025-07 一手成果；载荷大、启动慢，宜作预览路径。
- **Key quotes:** "enabling build123d to run entirely in the browser".
- **Source type:** 开源社区一手 | **Tier:** 2

### [42] build123d 官方文档
- **Summary:** Python 参数化 BREP 框架，基于 OpenCascade，API 干净完整；CadQuery 社区主导的现代重写。
- **Source type:** 官方文档 | **Tier:** 1

### [43] grandpacad 对比文
- **Summary:** CadQuery/build123d 都包裹 OCCT（FreeCAD 同源内核）；CadQuery 成熟链式、build123d 更现代——选 Python 即选 OCCT 路线。
- **Source type:** 博客 | **Tier:** 3

### [44] nTop: B-rep vs implicit
- **Summary:** B-Rep 圆角/偏置/布尔经常失败、面数过万崩溃；隐式"永不失败"且可全自动；距离场=即时偏置；有机形态是 B-Rep 明确弱项。
- **Key quotes:** "a distance field encodes all of the information needed to instantly offset an object".
- **Source type:** 厂商 CTO 技术长文 | **Tier:** 2

### [45] Blender devtalk: everything nodes
- **Summary:** Blender 万物皆节点+惰性求值的架构讨论；"bevel 修改器与流体仿真没有区别"——与懒仿真过程 DAG 同构。
- **Source type:** 官方开发者论坛 | **Tier:** 3

### [61] Bret Victor — Learnable Programming
- **Summary:** slider 擦洗执行、"压扁时间"让过程与轨迹成为同一事物的两种表示、前后并置对比——时间轴交互三性质的理论出处。
- **Key quotes:** "'Flattening time' allows the learner to see the process and its trajectory as two representations of the same thing".
- **Source type:** 经典论文式文章 | **Tier:** 1

### [62] Nardi & Miller — spreadsheet interface
- **Summary:** 电子表格成功于具体可见数据+即时反馈（压缩 test-evaluate-debug 循环）；公式=隐式控制流，改一格级联传播。
- **Source type:** 学术（经典） | **Tier:** 1

### [63] Ink & Switch — Potluck
- **Summary:** 渐进富化：乱记录→按需加结构与计算→每阶段都有用；灵感来自电子表格；动态注解叠加不破坏原件——草图态→调和的直接实证先例。
- **Key quotes:** "At every point along the way, the artifact remained useful".
- **Source type:** 研究机构 | **Tier:** 1

### [64] Josh Flowers — 四大 CAD 对比
- **Summary:** SolidWorks/Onshape 重建慢、特征树爱坏；Fusion "不捕获设计历史"逃生口被高度评价；流动设计中丢树是省力器。
- **Key quotes:** "Feature trees that often like to break".
- **Source type:** 从业者一手 | **Tier:** 3

### [65] Onshape Repair Manager
- **Summary:** 官方承认历史式参数化必然要修特征；批量修复；Rollback Bar 跳任意历史点；版本/分支= CAD 里的 git。[摘要来源：JS 渲染仅得摘要]
- **Source type:** 官方产品文档 | **Tier:** 1

### [66] r/SolidWorks timeline 辨析
- **Summary:** 从业者明确区分"特征树"（树）与"时间线"（线性擦洗）是两种心智模型。
- **Source type:** 社区 | **Tier:** 3

### [67] Adobe AE Responsive Design–Time
- **Summary:** 拉伸/重定时保护关键帧区域（淡入/淡出）不被改写——锁定点+范围化重解的产品先例。已核验。
- **Source type:** 官方文档 | **Tier:** 1

### [68] SourceCAD — SW vs Fusion
- **Summary:** 反方：大装配下特征树的组织性/可预测性是留存理由——用户要组织良好且重建可靠的历史。
- **Source type:** 教学博客 | **Tier:** 3

### [69] awesome-node-based-uis
- **Summary:** 节点编辑器生态索引：LiteGraph、Rete、React Flow 与大量产品案例——交互词表已高度标准化。
- **Source type:** 开源清单 | **Tier:** 2

### [70] r/node 选型讨论
- **Summary:** LiteGraph 功能全、React 栈选 React Flow；自研节点编辑器（连线/端口/命中/性能）成本极高。
- **Source type:** 社区 | **Tier:** 3

### [71] Artivoxa — Houdini vs Blender
- **Summary:** Houdini 全节点表达力最强但上手慢；Blender 修改器优先、节点可选；"把参数化藏在直接操作之下"是共识。
- **Source type:** 博客 | **Tier:** 3

### [72] Sarkar et al. — CHI 2020 spreadsheet
- **Summary:** 电子表格是赋能型技术、用户能力谱系很宽；可学习性来自直接操纵+可见反馈而非公式语言。
- **Source type:** 学术 | **Tier:** 1

### [73] Baldwin — Sous Vide Practical Guide
- **Summary:** 附录 C 转录两张官方表（FDA Food Code 2009 肉类；FSIS 禽肉按脂肪分档）；自算表基于 D 值（Juneja 2001，D60=5.48 min）。已核验。
- **Key quotes:** "Table C.1: Pasteurization times for beef… (FDA, 2009, 3-401.11.B.2)".
- **Source type:** 从业者权威指南 | **Tier:** 2

### [74] FDA Food Code 2009 §3-401.11.B.2
- **Summary:** 肉类巴氏杀菌官方表原始出处：130°F/112min → 145°F/4min——可直接编码为查表胶囊。
- **Source type:** 政府法规 | **Tier:** 1

### [75] USDA FSIS RTE 蛋制品合规指南
- **Summary:** 附录含官方巴氏杀菌时间-温度表（来源确认，抓取 403，数值待手动补录）。
- **Source type:** 政府文档 | **Tier:** 1

### [76] FDA Grade A PMO (2025)
- **Summary:** 牛奶巴氏杀菌法定来源：HTST 72°C/≥15s（批次式 63°C/30min 等效）；与 J. Dairy Sci. 2009 交叉印证。
- **Source type:** 政府法规 | **Tier:** 1

### [77] USDA ARS — 蛋黄酱模糊建模 (2008)
- **Summary:** 乳化稳定性的最前沿"模型"是配方特异的模糊/数据驱动拟合，非通用机理公式。
- **Source type:** 学术 | **Tier:** 1

### [78] Widerström & Öhman — 相转化
- **Summary:** 工业蛋黄酱灾难性相转化：给出实验性临界条件/工艺窗口，非闭式公式——支持"声明有效域的局部规则"。
- **Source type:** 学术 | **Tier:** 1

### [79] MDPI Foods — 蛋黄酱结构综述
- **Summary:** 稳定机制是定性规则（亲水胶体成膜防聚并）；稳定性靠测量（液滴尺寸、稳定指数）而非预测。
- **Source type:** 学术 | **Tier:** 1

### [80] TechCrunch — Samsung Food
- **Summary:** 2023-08 三星发布 Samsung Food（前 Whisk）：食谱发现/购物清单/备餐——纯消费端文本范式。
- **Source type:** 科技媒体 | **Tier:** 2

### [81] Samsung Newsroom
- **Summary:** 官方口径：AI 个性化食谱+备餐智能+家电联动；2024 加视觉识别。仍是生成+推荐范式。
- **Source type:** 官方新闻 | **Tier:** 2

### [82] Green Queen — NotCo Giuseppe
- **Summary:** Giuseppe 辅助食品科学家/主厨，概念到配方全流程；与 Kraft Heinz 合资——B2B 配方优化引擎。
- **Source type:** 行业媒体 | **Tier:** 2

### [83] Oxford Academic FST
- **Summary:** 同行评议确认 Giuseppe 处理成本/风味/可得性/可持续/采购等数千变量——约束满足式配方优化，非文本生成。
- **Source type:** 学术 | **Tier:** 1

### [84] Magnum × NotCo 新闻稿
- **Summary:** Giuseppe 为 Magnum 提供端到端 AI 产品创新——该类平台已有大企业付费落地。
- **Source type:** 官方新闻 | **Tier:** 2

### [85] iFactory 食品过程仿真页
- **Summary:** 最接近的单品：AI 重构建模、放大计算（传热/粘度/混合时间）、替代配料预测、"版本控制确保可追溯"。营销页，数字未核实——只当竞争信号。
- **Source type:** 产品营销页 | **Tier:** 2

### [86] FMI — AI 食品配方软件市场
- **Summary:** 预测 2026–2036 约 19.5% CAGR——赛道正在形成（聚合商数字，方向性参考）。
- **Source type:** 市场报告 | **Tier:** 3

### [87] Dataintelo — Recipe Generation AI
- **Summary:** 2025 年 $1.8B → 2034 年 $8.7B 预测——消费端文本生成已是独立商品市场。
- **Source type:** 市场报告 | **Tier:** 3

### [88] ACM 2025 — LLM 个性化食谱生成
- **Summary:** 学术现状代表：文本+视觉预览的生成范式，无版本控制/过程语义；同类有 RecipeGen 基准与 FoodSky。
- **Source type:** 学术 | **Tier:** 1

### [89] ChefSteps 官网
- **Summary:** 订阅制（$69/年 Studio Pass）；"370+ guides, tools, and calculators"；ingredient scaling tool；创始人出身 Modernist Cuisine。
- **Source type:** 产品官网 | **Tier:** 2

### [90] r/sousvide — ChefSteps 付费墙
- **Summary:** 濒临破产、被 Breville 收购、转订阅——分子料理工具生态的存活形态佐证。
- **Source type:** 社区 | **Tier:** 3

### [91] Modernist Cuisine 搜索 "calculator"
- **Summary:** 零结果（负发现）——公开网络端未见其计算器工具。
- **Source type:** 官网负结果 | **Tier:** 2

### [92] sousvidetools.com
- **Summary:** 第三方低温慢煮时间计算器活跃——时温计算已商品化/免费化。
- **Source type:** 工具站 | **Tier:** 3
