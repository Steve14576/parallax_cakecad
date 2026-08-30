# Subagent A 原始报告：食品物性与数据源检索

> Deep Research Wave 1 | 2026-08-30 | 角色：Retrieval Agent | 预算：8 WebSearch + 5 WebFetch | 来源编号：[1]-[11]

## Area Takeaways

**1A — 组分→物性推导:完全可行,且已有开箱即用的工具链。** USDA FoodData Central API 真实、免费、官方维护:任意用户注册 data.gov API key 即可调用(DEMO_KEY 可直接试用,30 次/小时;正式 key 默认 1000 次/小时),提供 `/food/{fdcId}`、`/foods/list`、`/foods/search` 等 REST 端点,返回水分/蛋白/脂肪/碳水/灰分等营养素,数据为 CC0 公有领域,且有 OpenAPI v3 规范(SwaggerHub 可下载)——这是"模型胶囊"成分输入端的理想数据源。Choi-Okos (1986) 模型确实从成分推导密度、比热、导热系数:对水/蛋白/脂肪/碳水/灰分/纤维/冰各组分用温度多项式 P(T)=A+B·T+C·T²,再用混合规则(密度=体积加和、比热=质量加权、导热=体积分数加权),系数已公开发表于 Choi & Okos (1986) 并被 Singh & Heldman《Introduction to Food Engineering》(5th ed., Table A.2.9)和 Sahin & Sumnu (2006) 教材收录;已有免费在线实现(如 foodtechcalc.com 估算器)和综述论文(《Journal of Food Science》2017, doi:10.1111/1750-3841.13564)验证其跨文献适用性。其他可用模型包括 Schwartzberg 模型与经验式 Siebel 比热公式(cp = 4.180·Xw + 1.547·Xprot + 1.672·Xfat + 1.42·Xcho + 0.836·Xash,kJ/kg·K),均可声明明确有效域。

**1B — 动力学与工艺参数:数值真实存在但分散,没有单一权威数据库;需按"论文即胶囊"逐个摄取。** Arrhenius 活化能数据散布于同行评审文献:如燕麦蛋白热变性 Ea≈480–575 kJ/mol(TUM)、鸡蛋清溶菌酶 50–90°C 变性动力学(PubMed)、DSC 测定淀粉糊化 Ea 的标准方法论文均已找到;但 8 次检索预算内未发现专门的"动力学参数手册",且存在非阿伦尼乌斯行为的警示文献(蛋白去折叠),胶囊必须声明温度有效域。热扩散率方面,ASHRAE Handbook—Refrigeration 第 9 章《Thermal Properties of Foods》是权威表格来源(含 Table 7 热扩散率表,单位 mm²/s),并明确说明实测值稀少、通常由 k/(ρ·cp) 计算得出;行业教材给出的未冻结食品典型范围 1.0–1.8×10⁻⁷ m²/s 与肉类 1.3–1.5×10⁻⁷ m²/s 一致。PAC/POD(冰点降低/甜度)系数在凝胶托职业圈完全公开:icecreamcalc、Gelatologist(Medium)、dairyscience.info、GameBob、Scoopulator 等多个开放计算器均以蔗糖为基准给出各糖类的 PAC/POD 系数,Scoopulator 甚至已直接接 USDA FDC 成分数据——证明"成分→工艺模型"管道已有先例。Overrun 有定量文献(《Food Reviews International》泡沫形成与稳定综述:30s 搅打时间下乳清蛋白/酪蛋白胶束的 overrun 对比;工业界典型值 ~100% 即体积含气 50%)。Lucas-Washburn √t 律有大量文献且已出现"适用判据"论文(Sci. Rep. 2015:重力可忽略的 CGR 判据 >3.0;墨水-纸张实验显示纤维素多孔介质可能偏离)——非常适合封装为"带有效域声明的胶囊"。巴氏杀菌表与蛋黄酱乳化稳定性模型本次未覆盖(预算耗尽),需后续检索。

**1C — 规模化文献摄取:成分类数据可整库机器摄取,动力学参数目前只能逐篇提取。** 已验证的机器可读整库来源:USDA FDC(API + 批量下载,CC0,含 SR Legacy / Foundation / FNDDS / Branded 四种数据类型)和 FAO/INFOODS BioFoodComp(全球分析型食品成分库,免费以 Excel 下载,含 6411 个食品条目、451 种组分),另有社区 REST 封装(如 littlebunch/fdc-api)。不存在"动力学参数的 NIST":8 次检索未发现任何结构化动力学参数库,糊化/变性/杀菌动力学值以论文表格+图形式报告(常为 DSC 曲线、Arrhenius 图的斜率),不是标准机读格式。结论:成分/物性层可以做到全自动摄取;动力学层需要"论文表格→模型胶囊"的半自动抽取管线(现代 PDF 表格解析/LLM 抽取现实可行,但必须保留人工审核与有效域声明),这恰好与 CakeCAD 的 evidence ladder 设计吻合。

## Sources

[1] USDA Agricultural Research Service — FoodData Central API Guide — https://fdc.nal.usda.gov/api-guide — 2026-08-30 — Tier: 1
Summary: 官方 API 文档。任何人可用,但每个请求须带 data.gov API key(DEMO_KEY 30 次/h、50 次/天;正式 key 1000 次/h/IP,超限返回 429)。两个端点:Food Search 与 Food Details;数据类型含 SR Legacy、Foundation Foods、FNDDS、Global Branded。数据 CC0 公有领域,提供 OpenAPI v3 规范。
Key quotes: "Anyone may access and use the API. However, a data.gov API key must be incorporated into each API request"; "USDA FoodData Central data are in the public domain and they are not copyrighted. They are published under CC0 1.0 Universal"; 端点表:`/food/{fdcId}`, `/foods`, `/foods/list`, `/foods/search`。

[2] FoodTech Calc — Food Physical Properties Estimator (Choi-Okos) — https://www.foodtechcalc.com/thermal/physical_properties_estimation/food-physical-properties-estimator — 2026-08-30 — Tier: 2
Summary: Choi-Okos (1986) 模型的免费在线实现:输入碳水/脂肪/蛋白/纤维/灰分/水分(质量%),输出任意温度下的密度、比热、导热系数。页面明示混合规则与组分多项式,并给出系数出处:Choi & Okos (1986) 原文、Singh & Heldman (2014) 5th ed. Table A.2.9、Sahin & Sumnu (2006)。证明系数公开且已有开放实现。
Key quotes: "ρ_mix = 1/Σ(Xᵢ/ρᵢ(T)) [volume additivity]; c_p,mix = Σ Xᵢ·c_p,i(T); k_mix = ρ_mix·Σ Xᵢ·kᵢ(T)/ρᵢ(T)"; "P(T) = A + B·T + C·T²"; Siebel cp: "4.180·Xw + 1.547·Xprot + 1.672·Xfat + 1.42·Xcho + 0.836·Xash"。

[3] Muniandy et al. (Purdue) / Wiley JFS — Composition-Based Prediction of Temperature-Dependent [Thermal Properties] — https://ift.onlinelibrary.wiley.com/doi/10.1111/1750-3841.13564 ; 另见 Purdue 应用论文: https://hammer.purdue.edu/articles/7438673 — 2026-08-30 — Tier: 1
Summary: 同行评审综述,分析 Choi & Okos (1986) 成果与更新研究的预测表现;Purdue 论文将"温度依赖物性 + Choi-Okos 预测模型"直接用于食品热加工模拟与配方选择(用 TPCell、Choi-Okos、KD2 Pro 三法对比 25°C/120°C 导热系数)。为"成分→物性"模型胶囊提供了学术验证与工程用法。
Key quotes: "The purpose of this paper is to analyze the outcomes from the Choi and Okos (1986) research, along with results from more recent research on [composition-based prediction]"; "Three methods, TPCell, Choi-Okos predictive model and KD2 Pro, were used to determine the thermal conductivity at 25°C and 120°C"。

[4] ASHRAE — Thermal Properties of Foods (ASHRAE Handbook—Refrigeration, Ch. 9) — https://www.researchgate.net/file.PostFileLoader.html?id=57dc0df6dc332d6c7a2b0e94... — 2026-08-30 — Tier: 1
Summary: 权威热物性手册章节,含"Table 7 Thermal Diffusivity of Foods"(mm²/s)等多种食品表格;明确指出实测热扩散率稀少,通常由导热系数/(密度×比热)计算。是热扩散率(含肉类 ~1.3–1.5×10⁻⁷ m²/s)的首选引用源。配套佐证:agriculture.institute 教材页(检索摘要)给出未冻结食品典型范围 1.0–1.8×10⁻⁷ m²/s(该页全文抓取被 403 拦截)。
Key quotes: "Experimentally determined values of food's thermal diffusivity are scarce. However, thermal diffusivity can be calculated using Equation (39)"; "Typical thermal diffusivity values for unfrozen foods range from about 1.0×10⁻⁷ to 1.8×10⁻⁷ m²/s"。

[5] PubMed / 期刊文献组 — 蛋白变性与淀粉糊化动力学(多篇) — https://pubmed.ncbi.nlm.nih.gov/16232451/ ; https://www.researchgate.net/publication/269693935 ; https://portal.fis.leibniz-lsb.tum.de/en/publications/thermal-denaturation-and-aggregation-of-oat-proteins... ; https://www.mdpi.com/1422-0067-27-14/6449 — 2026-08-30 — Tier: 1
Summary: 证据表明活化能数据分散于单一实验论文而非集中数据库:鸡蛋清溶菌酶 50–90°C 热变性伴随沉淀的动力学研究;用 DSC 数据确定淀粉糊化活化能的"基本方法"论文;燕麦蛋白变性/聚集的 Arrhenius 分析(Ea 480–575 kJ/mol);以及蛋白去折叠非阿伦尼乌斯动力学的机制研究(提示胶囊需声明温度有效域)。
Key quotes: "A kinetic study on the thermal denaturation accompanying precipitation of hen egg-white lysozyme was performed at temperatures between 50 and 90 degrees C"; "By Arrhenius analysis, activation energies were estimated to range from 480 to 575 kJ/mol across trials"。

[6] Gelatologist (Medium) — What PAC Is, and How to Calculate It — https://medium.com/@gelatologist/what-pac-is-and-how-to-calculate-it-2f1ade1bd5df — 2026-08-30 — Tier: 3
Summary: 职业凝胶托师的 PAC(抗冻力)计算教程,以蔗糖为基准将配方折算为等效蔗糖浓度,演示逐步计算。同类开放工具:icecreamcalc.com(2020-07-24,Tier 2,定义 FPDF/AFP/PAC)、dairyscience.info(给出各甜味剂 FPDF 系数计算示例,全文抓取被 418 拦截)、GameBob PAC/POD 计算器。结论:凝胶托行业的 PAC/POD 系数表完全公开且有多个开放实现。
Key quotes: "the recipe above has the equivalent freezing point depression power of a solution with 24.2gr of sugar in 100gr of water"; icecreamcalc: "Freezing point depression FPDF or Anti Freezing Power AFP or Potere Anti-Congelante PAC is the lowering of the freezing point of water"。

[7] Scoopulator — Ice Cream Calculator(接 USDA FDC 成分数据) — https://scoopulator.app/calc — 2026-08-30 — Tier: 2
Summary: 免费冰淇淋/凝胶托配方计算器,按成分的冰点降低与含水量近似不同温度下的硬度;其配料库直接引用 USDA FDC 条目(如 usdaff-746782、usdafndds-2705585、usdabranded-...),证明"FDC API → 食品工程计算"管道已有现成先例,可作为 CakeCAD 摄取管线的参照。
Key quotes: "This chart approximates the hardness of your ice cream at different temperatures based on the freezing point depression of ingredients and the water content"。

[8] Soukoulis et al. — Ice Cream: Foam Formation and Stabilization—A Review — https://www.tandfonline.com/doi/full/10.1080/87559120903564472 — 2026-08-30 — Tier: 1
Summary: 《Food Reviews International》同行评审综述,定量讨论搅打时间、蛋白类型对 overrun 的影响。配套行业来源:Elsevier《A review of ice cream manufacturing process and system》(2024,半系统性综述)与 Palsgaard 技术文章(典型 overrun ~100% 即空气占体积 50%)。Whipping/overrun 领域存在可引用的定量文献与工业经验值。
Key quotes: "At a short whip time (30 s), whey proteins and casein micelles contribute to a higher overrun than caseinate"; Palsgaard: "Ice cream normally has an overrun of around 100%, meaning that air makes up 50% of its volume"。

[9] Li, Zhang, Bian, Meng, Yang — Criteria for Applying the Lucas-Washburn Law — https://pmc.ncbi.nlm.nih.gov/articles/PMC4568521/ — 2026-08-30 — Tier: 1
Summary: Sci. Rep. 5, 14085 (2015, CC-BY)。系统给出 Lucas-Washburn √t 律的适用判据:重力不可忽略时失效,提出以毛细/重力比数判据——当该比值大于约 3.0 时 √t 律成立;并引用墨水-报纸片自发吸入实验(纤维素多孔介质,界面不遵循 LW 律)及非牛顿液体、纤维溶胀导致偏离的证据。为"海绵蛋糕吸糖浆"类胶囊提供了有效域声明的科学依据。
Key quotes: "the effect of gravity force on spontaneous imbibition may be ignored and Lucas-Washburn's law applies when [Ncg] > 3.0"; "the change in the property of the porous media (for example, swelling of the paper fibers during imbibition)" 导致偏离;"the ink-paper interface do not move according to the Lucas-Washburn law"。

[10] FAO/INFOODS — Food Composition Database for Biodiversity (BioFoodComp) / Analytical Food Composition Database — https://openknowledge.fao.org/handle/20.500.14283/i7364en ; https://www.b4fn.org/resources/publications/publication-item/.../biofoodcomp20/ — 2026-08-30 — Tier: 1
Summary: FAO/INFOODS 维护的全球分析型食品成分数据库,免费以 Excel 整库下载(含用户指南),BioFoodComp 2.0 版含 6411 个食品条目、451 种组分;另有 FAO 官方的成分数据校验指南。这是除 USDA FDC 外最重要的可整库机器摄取的成分数据源。
Key quotes: "you can download the FAO/INFOODS Food Composition Database for Biodiversity as a Microsoft Excel file"; "The database holds 6411 food entries from 11 food groups and 451 components"。

[11] littlebunch — fdc-api: REST API and utilities for USDA FoodData Central — https://github.com/littlebunch/fdc-api — 2026-08-30 — Tier: 2
Summary: 开源 REST 封装,可浏览/搜索/查询 USDA FDC 各数据源,证明 FDC 数据的程序化摄取已有成熟第三方工具生态,降低 CakeCAD 自建摄取层的工程风险。
Key quotes: "Provides a REST server to query and retrieve USDA FoodData Central datasets. You can browse foods from different sources, perform simple searches"。

**未覆盖缺口(预算已用尽)**:巴氏杀菌时间-温度表/热致死时间数据源、蛋黄酱乳化稳定性的定量模型检索未执行,建议下一轮补检(候选检索词:"thermal death time D value z value table pasteurization"、"mayonnaise emulsion stability rheology model")。
