# Subagent E 原始报告：补漏——巴氏杀菌表与乳化模型

> Deep Research Wave 2（Gap-Fill）| 2026-08-30 | 预算：5 WebSearch + 3 WebFetch（2 次被 403/验证码拦截）| 来源编号：[73]-[79]

## Area Takeaways

**Pasteurization（已填补，Baldwin 说法得到实证）：** 先前聊天中的声称**属实**——Douglas Baldwin 的《A Practical Guide to Sous Vide Cooking》附录 C 直接转录了两张官方表：Table C.1 引自 **FDA Food Code 2009 §3-401.11.B.2**（牛/羊/猪肉 130°F·112 min → 145°F·4 min），Table C.2 引自 **USDA FSIS** 禽肉按脂肪含量（1–12%）的巴氏杀菌时间表；他自算的 Tables 3.1/4.1/5.1 则明确基于 D 值/z 值（正文示例：Salmonella 在牛肉中 D₆₀⁶·⁰ = 5.48 min），核心数据来源是同行评审文献 **Juneja et al. 2001 (J. Food Sci. 66:146–152)** 与 Snyder (2006)。牛奶方面，**FDA Grade "A" Pasteurized Milk Ordinance (PMO)** 是权威来源（HTST 最低 72°C/15 s，同行评审文献交叉确认）。鸡蛋方面，**USDA FSIS《RTE 蛋制品合规指南》**确认含官方巴氏杀菌时间-温度表（附录中），且 2018 年联邦法规修订案确认旧 9 CFR 中有强制时间表——但这两个页面在本次预算内分别被 403 和验证码拦截，**表内具体数值未能抓取**（来源已锁定为 Tier 1，后续直接下载即可）。ICMSF 未在本次检索中直接命中，不作声称。

**Emulsions（部分填补——结论是"无普适定量模型"，这本身即有效发现）：** 文献中没有可用于 CAD 的普适蛋黄酱破乳定量模型；现有证据是三类的组合：(a) USDA ARS 用**模糊建模（fuzzy modeling）**拟合蛋黄酱乳化稳定性与粘度（数据驱动、配方特定，非机理模型）；(b) 相转化研究（Widerström & Öhman）针对工业生产中的**灾难性相转化**给出的是实验性临界条件而非封闭公式；(c) 机理层面（HLB、液滴尺寸、絮凝/聚并）只有定性规则与体系特定的实测参数（如离子强度/pH 对聚并稳定性的影响，Langmuir）。**对 CakeCAD 的建议**：将乳化稳定性实现为"局部预测规则 + 声明有效域"——例如基于油相体积分数接近紧密堆积（≈0.74）与配方 HLB 的经验判据，并显式标注适用配方范围；这与文献现状一致，不算过度建模。

## Sources

[73] Douglas Baldwin — A Practical Guide to Sous Vide Cooking — https://douglasbaldwin.com/sous-vide.html — 2026-08-30 — Tier: 2
Summary: 完整抓取成功（~97 KB）。实证验证了 Baldwin 使用公开权威表：附录 C "Government Pasteurization Tables" 含 FDA Food Code 与 FSIS 两张官方表；正文以 D 值/z 值方法推导自家表，并给出完整参考文献表（Juneja 2001、Snyder 2006、Rybka-Rodgers 2001 等）。
Key quotes: "This is often referred as a one decimal reduction and is written D₆₀⁶·⁰ = 5.48 minutes… (Juneja et al., 2001)"；"Table C.1: Pasteurization times for beef, corned beef, lamb, pork and cured pork (FDA, 2009, 3-401.11.B.2)"；Table C.2 为 FSIS 禽肉表，按 1%–12% 脂肪分列（136°F 时 64–81.4 min）。

[74] FDA — Food Code 2009, §3-401.11.B.2（经 Baldwin Table C.1 转录）— https://douglasbaldwin.com/sous-vide.html#Government_Pasteurization_Tables — 2026-08-30 — Tier: 1
Summary: 肉类巴氏杀菌官方时间-温度表的原始出处。关键数据点：130°F (54.4°C) 112 min；136°F (57.8°C) 28 min；140°F (60°C) 12 min；145°F (62.8°C) 4 min——可直接编码为 CAD 查找表。
Key quotes: 见 [73] 中 Table C.1 原文。

[75] USDA FSIS — Compliance Guide for Ready-to-Eat Egg Products（附录含巴氏杀菌时间-温度表）— https://www.fsis.usda.gov/sites/default/files/import/Compliance_Guide_RTE_egg_products.pdf — 2026-08-30 — Tier: 1（来源确认；抓取被 403 拦截，表内数值待补）
Summary: 搜索摘要确认"Time and temperature tables are located at the end of the document in the Appendix for Pasteurization Time and Temperature Tables"。这是鸡蛋巴氏杀菌的权威表源；另有 2018 年联邦法规（Egg Products Inspection Regulations, federalregister.gov/documents/2018-02-13/2018-00425）确认历史上法规含强制时间表（该页触发反爬验证码，未绕过）。
Key quotes: "The time and temperature tables are located at the end of the document in the Appendix for Pasteurization Time and Temperature Tables."

[76] FDA — Grade "A" Pasteurized Milk Ordinance (PMO, 2025 版 PDF) — https://www.fda.gov/media/193438/download — 2026-08-30 — Tier: 1
Summary: 牛奶巴氏杀菌的法定权威来源；多个独立来源一致确认其核心要求为 HTST 72°C (161°F) 保持 ≥15 s（及批次式 63°C/30 min 的等效规定）。
Key quotes: 同行评审综述佐证："The grade A Pasteurized Milk Ordinance specifies minimum processing conditions of 72°C for at least 15 s for high temperature, short time (HTST) pasteurized [milk]"（J. Dairy Sci., 2009, PubMed 19762797 / sciencedirect.com/science/article/pii/S0022030209708112 — Tier 1）。

[77] USDA ARS — Formulation and fuzzy modeling of emulsion stability and viscosity of mayonnaise (2008) — https://www.ars.usda.gov/ARSUserFiles/30200510/2008%20-%20Formulation%20and%20Fuzzy%20Modeling%20-%20Mayonnaise.pdf — 2026-08-30 — Tier: 1
Summary: USDA 农业研究署托管论文：对蛋黄酱在 4/23/40°C 下的乳化稳定性与粘度用**自适应模糊模型**建模——说明该领域最前沿的"模型"是配方特定的数据驱动拟合，而非通用机理公式。
Key quotes: "All mayonnaise treatments were evaluated and compared based on emulsion stability and viscosity at 4, 23, and 40 °C. In addition, an adap[tive fuzzy model]…"

[78] Widerström & Öhman — Mayonnaise: Quality and Catastrophic Phase Inversion — https://www.semanticscholar.org/paper/Mayonnaise%3A-Quality-and-Catastrophic-Phase-Widerstr%C3%B6m-%C3%96hman/d72e3744d396093c79f345cedc212a7ec5aa6e6b — 2026-08-30 — Tier: 1（学术）
Summary: 针对蛋黄酱工业生产中相转化风险的研究：目标是"得到高质量产品并避免相转化"。提供的是实验性临界条件/工艺窗口，非普适公式——支持"声明有效域的局部规则"这一工程化路线。
Key quotes: "In industrial production of mayonnaise it is important to both get a product of high quality and to avoid phase inversion."

[79] Foods (MDPI) 综述 — Mayonnaise main ingredients influence on its structure as an emulsion — https://pmc.ncbi.nlm.nih.gov/articles/PMC9114219/ — 2026-08-30 — Tier: 1
Summary: 同行评审综述，确认蛋黄酱稳定机制表述为定性机理规则（水胶体包覆油滴薄膜抑制聚并等），无封闭稳定性公式。配套证据：MDPI Appl. Sci. 14(3):1069《Critical Review of Techniques for Food Emulsion Characterizing》表明稳定性靠**测量**（液滴尺寸、乳化稳定性指数）而非预测；Langmuir (doi:10.1021/la046891w) 给出离子强度/pH 对聚并的定量实测——均为体系特定参数。
Key quotes: "Hydrocolloids can stabilize emulsions by two main mechanisms; first by coating the oil droplets as a thin film to prevent them from coalescence…"

**未填补项声明**：(a) FSIS 蛋制品表与联邦法规的具体数值未能在预算内抓取（403/验证码），但两份文档的存在与"含官方表"已确认；(b) ICMSF 数据未直接命中，未纳入来源清单。
