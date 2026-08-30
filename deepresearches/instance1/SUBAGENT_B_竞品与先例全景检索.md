# Subagent B 原始报告：竞品与先例全景检索

> Deep Research Wave 1 | 2026-08-30 | 角色：Retrieval Agent | 预算：8 WebSearch + 5 WebFetch | 来源编号：[16]-[30]（另：Jelly 原编号 [31] 与架构代理撞号，已重分配为 [15]）

## Area Takeaways

**2A:** 付费配方模拟软件品类确实存在且长期存活:BeerSmith(桌面+Web+移动,买断制,20+ 年历史,站内 210 万配方,模拟 ABV/IBU/色度/水化学)是家酿领域事实标准,其订阅制竞品 Brewfather/Brewer's Friend 同样收费;意式冰淇淋行业有多个专业付费"平衡"工具(如 Gelatodemy、icecreamcalc、Scuola Gelato),核心是 PAC/POD/固形物/脂肪/糖的配方平衡计算。烘焙领域则只有廉价的 baker's percentage 换算器,未发现真正的专业烘焙模拟工具——这是 CakeCAD 相对空白的切入点。总体共识:消费者/手作端的配方数学模拟是已被验证的付费品类,但都是"静态计算器",无时间轴、无分支、无溯源。

**2B:** 未找到与"配方即时间轴/过程状态机/食品 CAD"概念直接对应的产品;最接近的先行者是 Cooklang(开源配方标记语言,官方博客专门教用 Git 管理 .cook 文件、强调 diff 与协作,即"git for recipes"思潮的代表)和 Cakenote(蛋糕装饰行业的 2D/3D/AI 设计+报价一体软件,但无过程模拟)。学术界有 MIT Media Lab "Computational Food"(食物作为可编程介质的实验)与 Ganesh Bagler 的 Computational Gastronomy(风味网络/规则化理解烹饪),但都停留在研究而非产品。搜索中还出现个人博客级文章("The Protocol of Taste")明确提出配方版本控制/回滚类比软件版本管理,说明该概念在 LLM 时代有自发讨论,但未形成成熟竞品。

**2C:** 工业端的食品/生物过程模拟由化工巨头级工具垄断:SuperPro Designer(Intelligen)支持 140+ 单元操作、物料/能量衡算、批次调度与甘特图、成本核算,明确覆盖食品与消费品行业,买断价 $15,950/拷贝、租赁 $6,380/年——与厨房场景存在 3~4 个数量级的价格与复杂度断层。专业厨房软件(如 Jelly、Galley XAI 航空配餐、SmartKitchen 数字 HACCP)只做成本/库存/合规与温度记录,均无物理/过程模拟。共识:市场两端(消费计算器 ↔ 工业模拟器)之间,"厨房研发用、时间轴优先、带仿真与溯源的过程 CAD"这一中间层没有成熟产品,定位缺口成立。

## Sources

[16] BeerSmith Inc. — BeerSmith Home Brewing Software(官网)— https://beersmith.com/ — 2026-08-30 — Tier: 2
Summary: 官方首页确认 BeerSmith 4 已发布(2026-03 博客预告桌面版),提供桌面(买断)+Web+移动多端架构;站内托管超过 210 万份用户配方并可按设备缩放;附论坛、300+ 期播客、教程体系,表明该产品具备 20 年以上的持续经营与社区生态。
Key quotes: "The New BeerSmith 4 is available"; "Over 2.1 million beer recipes are stored on our BeerSmith recipe site"; "scale any recipe to match your equipment in minutes".

[17] r/Homebrewing — What brewing software do you guys use? — https://www.reddit.com/r/Homebrewing/comments/lh4541/what_brewing_software_do_you_guys_use/ — 2026-08-30 — Tier: 3
Summary: 社区共识帖:首选为 Brewfather(云端/订阅、UI 好)与 BeerSmith(高级功能),二者均做 IBU、色度、目标配方反推等计算;佐证家酿配方模拟是多个产品长期竞争的付费市场。
Key quotes: "the overall favorites are Brewfather (for UI, cloud features) and Beersmith for advanced uses".

[18] Gelatodemy — Gelato Balancing Software for Professional Gelato Makers — https://gelatodemy.com/en/ice-cream-balancing-software/ — 2026-08-30 — Tier: 2(403 未能抓取正文,以搜索摘要为准)
Summary: 面向职业 gelato 师的付费平衡软件,自动计算 PAC(抗冻力)、POD(甜度)、固形物、脂肪、糖比例;定位语"Stop improvising"表明专业作坊把它当生产必需工具。
Key quotes: "The software automatically calculates PAC, POD, percentage of solids, fats, sugars, and much more. Stop improvising."

[19] icecreamcalc.app — Ice Cream Calc: Gelato & Ice Cream Calculator(知识库)— https://www.icecreamcalc.app/kb/introduction — 2026-08-30 — Tier: 2
Summary: 自称"Professional gelato and ice cream calculator",做 PAC/POD/固形物/混合料平衡;页脚显示托管配方数达 18,271(实时浮动计数,后经核验时已涨至 18,392),说明专业计算器有真实用户规模。
Key quotes: "Professional gelato and ice cream calculator for precise PAC, POD, solids, and mix balance calculations"; "Help Total Recipes 18,271".

[20] Scuola Gelato — Gelato Naturale Balancing Software — https://www.scuolagelato.it/en/gelato-naturale-balancing-software/ — 2026-08-30 — Tier: 2
Summary: 意式冰淇淋学校出品的付费"配方平衡"软件,主打 Anti Freezing Power(PAC)计算,宣称帮用户节省时间与原料;进一步证明该细分赛道有多个独立厂商。(注:Gelato University/Carpigiani 工具与 GelatoPro 因抓取预算限制未能逐一核实。)
Key quotes: "A professional software to balance the perfect ice cream recipe that will allow you to save time and resources! Anti Freezing Power (PAC)".

[21] Bakerspercentagecalc.com — Baker's Percentage Calculator: Professional Recipe Scaling Tool — https://bakerspercentagecalc.com/ — 2026-08-30 — Tier: 3
Summary: 烘焙端工具基本止步于 baker's percentage 换算与缩放(本页及多个同名 app 均如此),未发现带发酵/热过程模拟的专业烘焙软件;Fourish/BakeStreet/Crumb 未在本次检索中获得有效结果。
Key quotes: "Calculate precise baker's percentages for your recipes with our professional calculator."

[22] Cooklang — Version Control Your Recipes with Git — https://cooklang.org/blog/43-version-control-recipes-with-git/ — 2026-08-30 — Tier: 2
Summary: Cooklang(开源配方标记语言)官方指南:把配方存成 .cook 文件进 Git 仓库,强调文本 diff 可用、可协作;是"git for recipes"实践最成形的先行者,但仅限版本管理,无过程模拟/时间轴。
Key quotes: "why diffs on .cook files are actually useful, collaborating with others".

[23] MIT Media Lab — Computational Food(项目概览)— https://www.media.mit.edu/projects/computational-food/overview/ — 2026-08-30 — Tier: 1(检索摘要;页面抓取超时)
Summary: MIT Media Lab 的研究项目,把食物当作"可变形"的可编程介质做交互实验;证明"食物即程序"在学术层面被探索过,但没有落地为面向厨房研发的 CAD 产品。
Key quotes: "Computational Food is a series of experiments around the shape-changing nature of food and its associated unique sensory experiences."

[24] Ganesh Bagler 等 — Computational Gastronomy / computationalgastronomy.org — https://computationalgastronomy.org/ — 2026-08-30 — Tier: 1/2
Summary: 计算美食学被定义为"让食物可计算"的多学科领域(配套论文《Computational gastronomy: A data science approach to food》,研究风味网络、营养、健康与环境的规则化理解);相关研究还有 PMC 综述"making (food) computable"。这是学术谱系而非竞品,可作为 CakeCAD 的理论参照。
Key quotes: "Computational Gastronomy is an emergent multi-disciplinary field that brings together various sciences and technologies to make food computable."

[25] Cakenote — Cake Design, Costing & Business Software — https://app.cakenote.com/ — 2026-08-30 — Tier: 2
Summary: 现有最接近"蛋糕设计软件"的产品:2D/3D/AI 设计蛋糕,边设计边联动成本与建议售价,再接订单管理;但关注点在外观设计与商业流程,完全不涉及工艺过程/时间轴模拟。
Key quotes: "Design a cake in 2D, 3D or with AI, watch the cost and suggested price update as you build".

[26] Intelligen Inc. — SuperPro Designer Overview(官方产品文档,已完整抓取)— https://www.intelligen.com/static/superpro_overview.html — 2026-08-30 — Tier: 1
Summary: 工业批次过程仿真标杆:140+ 单元操作模型、严格反应器模块、物料/能量衡算、批次调度、产能/瓶颈分析、资源(公用工程/原料/人力)随时间跟踪、工艺经济学;官方明确用户覆盖 Pharmaceutical, Biotech, Specialty Chemical, **Food**, Consumer Goods 等。定价:买断 $15,950/拷贝,租赁 $6,380/拷贝/年,另有 Lite/VR 阉割版与教育版、免费评估版。
Key quotes: "facilitates modeling, evaluation and optimization of integrated processes in a wide range of industries (Pharmaceutical, Biotech, Specialty Chemical, Food, Consumer Goods…)"; "Models for over 140 unit procedures"; "Purchase…15,950 / Lease…6,380".

[27] ISEKI-Food Network — Course on Batch/Bio Process Modeling, Cost of Goods Analysis — https://www.iseki-food.net/events/course-batch-bio-process-modeling-cost-goods-analysis-production-planning-scheduling-and-0 — 2026-08-30 — Tier: 2
Summary: 欧洲食品学术网络的教学课程采用 SuperPro,列出精简版价格:SuperPro LT 定价 $1,000、SchedulePro LT $900——从侧面给出工业仿真软件"轻量版"的价格锚点。
Key quotes: "SuperPro LT (list price $1000/copy) and SchedulePro LT (list price $900)".

[28] SmartKitchen — Digital HACCP products and licenses — https://smartkitchen.solutions/en/digital-haccp-commercial-kitchen/digital-haccp-products-and-licenses/ — 2026-08-30 — Tier: 2
Summary: 商用厨房数字 HACCP 合规产品:温度监测、留样、报警、云端报表,按许可证收费——证明"时间-温度历史追踪"在专业厨房是付费刚需,但产品只做合规记录,不含任何过程仿真。
Key quotes: "temperature monitoring, digital samples, alarms, and cloud reporting".

[29] IFCS — Galley XAI Aviation Catering Food Production & Costing Software — https://ifcs.aero/galleyx/aviation-catering-food-costing/ — 2026-08-30 — Tier: 2
Summary: "Galley"系专业厨房软件的真实形态:航空配餐场景下按航班需求做配方级成本与生产排程,是生产管理/成本类软件的典型,无物理模拟功能。
Key quotes: "recipe-level cost visibility tied directly to actual flight demand, scheduling".

[30] Quantz — The Protocol of Taste: Quantifying Culinary Process Through Distributed Systems — https://www.quantz.top/posts/the-protocol-of-taste-quantifying-culinary-process-through-distributed-systems — 2026-08-30 — Tier: 3
Summary: 个人博客文章,用分布式系统类比烹饪过程,明确提出"配方版本控制/回滚,类似 git for recipes";作为概念在独立开发者圈自发出现的证据,非产品。
Key quotes: "the system can roll back to the previous version across all sites. This is analogous to software version control—git for recipes."

[15] Jelly — Food Costing & Kitchen Management Software — https://www.getjelly.co.uk/ — 2026-08-30 — Tier: 2（原编号 [31]，因撞号重分配）
Summary: 英国餐饮厨房成本管理软件:自动处理供应商发票、实时维护食材成本/配方/毛利;与 MarginPro、Recipe Costing 同类,进一步确认专业厨房软件赛道=财务与库存,无人做过程物理仿真。
Key quotes: "Jelly automates supplier invoices and keeps food costs, recipes and margins live".

---

**检索执行说明(供主代理)**:已用满 8 次 WebSearch 与 5 次 WebFetch;WebFetch 中 Gelatodemy(403)、MIT Media Lab(超时)、Cooklang(工具异常)三次抓取失败,相应条目以搜索引擎摘要替代(已在条目中标注)。ChefSteps/Modernist Cuisine 计算器、鸡尾酒软件(Alcademy 等)、gPROMS/Aspen 食品应用、COMSOL 食品应用、Galley Solutions/MarginPro 详细功能、LLM 时代 AI 配方创业公司——因预算耗尽未能专项检索,仅在相邻搜索中获得间接信号;建议其他分区代理补位。
