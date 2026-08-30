# Subagent F 原始报告：补漏——LLM 时代配方创业公司与分子料理工具

> Deep Research Wave 2（Gap-Fill）| 2026-08-30 | 预算：5 WebSearch + 3 WebFetch | 来源编号：[80]-[92]

## Area Takeaways

**LLM-era recipe startups:** 2023–2026 的 AI 食品创新明显分成两层：消费端几乎全是"纯文本食谱生成"的商品化产品（如 Samsung Food——即被三星收购的 Whisk 在 2023 年 8 月重新发布为 AI 个性化食谱/备餐服务，另有 SmartChef 等基于 Gemini 的学术 demo），它们没有过程/物理/版本控制语义，对 CakeCAD 不构成实质威胁；真正贴近威胁在 B2B 食品研发侧——NotCo 的 Giuseppe AI 已商业化为"端到端食品配方与创新平台"（服务 Magnum/Kraft Heinz 级别客户，处理成本、风味、供应链等数千变量），市场报告显示"AI 食品配方与研发软件"以 ~19.5% CAGR 增长；最接近的单品是 iFactory 的"食品过程模拟 + AI 配方优化"页面：重构建模、实验室→量产放大计算（热传导/粘度/混合时间）、替代配料预测，且明确宣传"协作工作区 + 版本控制以保证可追溯性"。未发现任何做"git for recipes"的消费级创业产品。**未能在预算内核实**: ChefGPT / RecipeIQ / Platejoy / Foodpairing / YC 系食品 AI 的具体现状（学术文献 [88] 及相邻结果显示该领域研究活跃但产品化薄弱）。

**Molecular gastronomy tools:** ChefSteps 确认存活：已从破产边缘（被 Breville 收购，Reddit 佐证，Tier 3）转型为订阅制内容站（$69/年 Studio Pass），官方首页明确列出"370+ guides, tools, and calculators"及独立的"ingredient scaling tool"，证明分子料理时代的计算器类工具（时间-温度、配比缩放）如今被关在付费墙内而非开放竞争；其创始人 Grant Crilly 本身就出身 Modernist Cuisine 团队。Modernist Cuisine 官网站内搜索 "calculator" 返回零结果——在本预算内**未找到**其发布任何计算器/交互工具的证据（该子缺口未填补，其产出仍以书籍+免费食谱为主）；第三方仍有 sousvidetools.com 之类的独立时间计算器存在（Tier 3）。

## Sources

[80] TechCrunch — Samsung launches a meal planning and recipe discovery platform called Samsung Food — https://techcrunch.com/2023/08/30/samsung-launches-a-meal-planning-and-recipe-discovery-platform-called-samsung-food/ — 2026-08-30 — Tier: 2
Summary: 三星于 2023-08-30 全球发布 Samsung Food（基于收购的 Whisk），功能为食谱发现、购物清单、备餐计划、创作者社区。属纯消费端食谱文本/计划类商品，无过程语义。
Key quotes: "just like Whisk, users can look for recipes, create shopping lists, create meal plans and follow creators posting recipes."

[81] Samsung Newsroom — Samsung Announces Global Launch of Samsung Food — https://news.samsung.com/global/samsung-announces-global-launch-of-samsung-food-an-ai-powered-personalized-food-and-recipe-service — 2026-08-30 — Tier: 2
Summary: 官方口径：AI 个性化食谱、备餐智能、家电联动；2024 加入视觉识别（拍食物给食谱）。仍是"生成+推荐"范式。
Key quotes: "Customized recipes, meal planning intelligence and smart home compatibility all combine in the new AI-powered service."

[82] Green Queen Media — Inside NotCo's AI-Driven Food Revolution — https://www.greenqueen.com.hk/notco-ai-giuseppe-food-tech-kraft-heinz-not-company/ — 2026-08-30 — Tier: 2
Summary: NotCo 的 Giuseppe 是辅助食品科学家/主厨/产品开发者的 AI 系统，覆盖从概念到配方的全流程；已与 Kraft Heinz 等成立合资合作。属 B2B 配方优化引擎，是 CakeCAD"配方即程序"命题在工业端的对照物。
Key quotes: "NotCo's Giuseppe is an AI system that complements the work of food scientists, chefs, product developers, from concept creation all the way to…"

[83] Oxford Academic (Food Science & Technology) — Inside the data-driven revolution — https://academic.oup.com/fst/article/39/4/32/8382822 — 2026-08-30 — Tier: 1
Summary: 同行评议综述确认 Giuseppe AI 处理成本、风味、可得性、可持续性、采购约束等数千变量做配方决策——即真正的"约束满足式配方优化"，非文本生成。
Key quotes: "NotCo AI uses Giuseppe AI to process thousands of variables such as cost, flavour, availability, sustainability, sourcing constraints…"

[84] Magnum Ice Cream Company Newsroom — The Magnum Ice Cream Company partners with NotCo AI — https://news.magnumicecream.com/the-magnum-ice-cream-company-partners-with-notco-ai/ — 2026-08-30 — Tier: 2
Summary: 官方新闻稿：NotCo 作为 TMICC 创新伙伴，用 Giuseppe 提供"端到端"AI 引导的产品创新，证明该类平台已有大企业付费落地。
Key quotes: "NotCo is using its cutting edge, end-to-end AI platform, Giuseppe AI, to provide AI-guided innovation and product development."

[85] iFactory App — Food Process Simulation: AI Recipe Formulation Optimization & Production Scaling Analytics — https://ifactoryapp.com/industries/food-manufacturing/food-process-simulation-recipe-formulation-ai-scaling — 2026-08-30 — Tier: 2（公司官方产品页；营销数字未经独立验证）
Summary: **与 CakeCAD 命题最接近的现存产品页面**：AI 重构建模（如减钠 30% 的神经网络感官预测）、实验室→中试→量产放大计算（热传导/粘度/混合时间）、替代配料预测（置信度评分）、温度/压力/转速工艺参数优化、以及"协作工作区 + 版本控制保证可追溯"。注意：未见于主流科技媒体，数字疑为营销话术，建议作为竞品线索而非权威数据引用。
Key quotes: "Simulate and optimize food processes with AI. Covers recipe reformulation modeling, production scaling calculations, ingredient substitution"; "Version control ensures traceability"; "AI models analyze existing recipes and predict outcomes when ingredients are replaced or ratios adjusted."

[86] Future Market Insights — AI-Enabled Food Formulation & R&D Software Market — https://www.futuremarketinsights.com/reports/ai-enabled-food-formulation-and-r-and-d-software-market — 2026-08-30 — Tier: 3
Summary: 市场报告称"AI 食品配方与研发软件"2026–2036 预计 19.5% CAGR 增长，佐证该赛道正在形成（报告方为市场研究聚合商，数字仅供参考）。
Key quotes: "Demand for AI-enabled food formulation and R&D software is projected to expand at 19.5% CAGR between 2026 and 2036."

[87] Dataintelo — Recipe Generation AI Market Research Report 2033 — https://dataintelo.com/report/recipe-generation-ai-market — 2026-08-30 — Tier: 3
Summary: "Recipe Generation AI" 市场 2025 年估值 $1.8B、2034 预计 $8.7B（19.2% CAGR）——表明消费端生成已是独立市场类目，多为文本生成商品。
Key quotes: "The Recipe Generation AI market was valued at $1.8 billion in 2025 and projected to reach $8.7 billion by 2034."

[88] ACM Digital Library — An LLM-Based Interactive System for Personalized Recipe Generation — https://dl.acm.org/doi/10.1145/3746027.3754489 — 2026-08-30 — Tier: 1
Summary: 2025 年 ACM 论文代表学术界现状：LLM 个性化食谱生成 + 文本/视觉预览，属文本生成范式，无版本控制/过程模拟。同类还有 arXiv RecipeGen 多模态基准（https://arxiv.org/html/2506.06733v3）与 ScienceDirect FoodSky 食品领域 LLM（https://www.sciencedirect.com/science/article/pii/S2666389925000820），均证明研究活跃但无过程语义。
Key quotes: "The system provides both textual and visual previews of the adapted recipes."

[89] ChefSteps 官网 — Home — https://www.chefsteps.com/ — 2026-08-30 — Tier: 2（官方产品文档）
Summary: ChefSteps 现状确认：订阅制（免费层 + $69/年 Studio Pass）；付费层含 "Access to 370+ guides, tools, and calculators" 与 "Use of our ingredient scaling tool"；另有 Connected Cooking（Joule 低温慢煮等硬件）。分子料理时代的计算器工具仍存在但已付费墙化。创始人 Grant Crilly 简介明确其出身 Modernist Cuisine 团队。
Key quotes: "✓ Access to 370+ guides, tools, and calculators"; "✓ Use of our ingredient scaling tool"; Grant Crilly "worked on the award-winning cookbook series Modernist Cuisine".

[90] Reddit r/sousvide — ChefSteps just took formerly free recipes and put them behind a paywall — https://www.reddit.com/r/sousvide/comments/ims4b0/ — 2026-08-30 — Tier: 3
Summary: 社区佐证 ChefSteps 曾濒临破产、被 Breville 收购拯救，随后转向付费订阅（背景约 2020）。
Key quotes: "They were saved from bankruptcy by being bought out by Breville."

[91] Modernist Cuisine 官网站内搜索 "calculator" — 零结果 — https://modernistcuisine.com/?s=calculator — 2026-08-30 — Tier: 2（官方站点，负结果）
Summary: 官网 WordPress 搜索 "calculator" 无任何匹配。**未填补的缺口**：在预算内未找到 Modernist Cuisine 发布过计算器/交互工具的证据；不能断言其没有（可能在书籍/APP 中），但公开网络端未见。
Key quotes: "Sorry, but nothing matched your search terms."

[92] sousvidetools.com — Sous Vide Cooking Time Calculator — https://www.sousvidetools.com/sous-vide-cooking-time-calculator — 2026-08-30 — Tier: 3
Summary: 第三方独立低温慢煮时间计算器存在并活跃，说明"时间-温度计算"类工具早已商品化/免费化（ChefSteps 的经典时温表被此类站点广泛承接），不构成新竞品。
Key quotes: "The Sous Vide Cooking Calculator… generating recipe suggestions tailor made for you."

**明确未填补的缺口**：(1) ChefGPT / RecipeIQ / Platejoy / Foodpairing / YC 系食品 AI 创业公司的逐项现状在 5 次搜索预算内未能直接核实；(2) Modernist Cuisine 计算器工具无正面证据（仅负结果 [91]）。预算使用：5/5 WebSearch，3/3 WebFetch（ifactoryapp 首取超时后在剩余配额内重试成功）。
