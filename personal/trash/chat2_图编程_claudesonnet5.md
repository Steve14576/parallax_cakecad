# 蛋糕设计物料管理

*Exported on 2026年8月28日 10:58:57*

**User**:

如果要做一个CakeCAD，你会怎么做呢

---
**Assistant**:

# CakeCAD：蛋糕设计与制作的CAD系统

有意思的想法！让我从产品定位、核心技术、到实现路径梳理一下。

---

## 一、先想清楚：给谁用？

这决定了整个系统的形态，我倾向于做**分层产品**：

| 层级 | 用户 | 核心诉求 |
|---|---|---|
| **Lite（Web/移动）** | 消费者定制蛋糕 | 拖拽选配 → 看到效果 → 下单 |
| **Pro（桌面/Web）** | 蛋糕师、烘焙工作室 | 精确设计、结构验证、成本核算、生产工单 |
| **Factory** | 中央工厂、连锁品牌 | 参数化SKU、批量物料、3D打印/切割机对接 |

**关键洞察：CakeCAD 和传统 CAD 最大的区别是——它不只是"造型工具"，而是"造型 + 材料 + 工艺 + 成本"的联合求解器。** 一个再漂亮的设计，如果奶油撑不住、烤箱放不下、成本超预算，就是废设计。

---

## 二、建模范式：为什么不能直接用SolidWorks的思路

蛋糕的几何特征：
- 大量**旋转体**（圆形胚）、**拉伸体**（方形胚）→ 参数化天然适配
- **分层堆叠**（Tier）是绝对主导结构
- **表面装饰**是重头戏，且是"薄壳 + 贴附"语义
- 大量**软体/流体**形态（淋面、奶油裱花）→ 传统B-Rep很难描述

我的方案是 **混合表示（Hybrid Representation）**：

```
CakeDoc
├── Structure Layer   → B-Rep / 参数化实体（蛋糕胚、支撑柱、底托）
├── Coating Layer     → 偏移曲面 + 厚度场（抹面、翻糖皮、淋面）
├── Decoration Layer  → 实例化装饰件（Instancing）+ 曲面吸附
├── Piping Layer      → 参数曲线 + 扫掠截面（裱花）
└── Material/Process  → 非几何元数据
```

### 核心数据结构草图

```typescript
// 一个 Tier（层）是最小结构单元
interface Tier {
  id: string;
  profile: Profile2D;        // 截面：圆/方/心形/自定义曲线
  height: number;            // mm
  taper?: number;            // 收口角度
  layers: SpongeLayer[];     // 内部夹层（胚+夹馅+胚+夹馅...）
  coating: Coating;          // 外层：奶油/翻糖/巧克力
  support?: DowelSystem;     // 支撑柱系统
  transform: Mat4;
}

interface SpongeLayer {
  type: 'sponge' | 'filling';
  material: MaterialRef;     // 关联材料库
  thickness: number;
  compressibility: number;   // 关键！用于承重计算
}

interface Decoration {
  asset: AssetRef;           // 糖花/巧克力件/水果/字牌
  attachment: {
    mode: 'surface-snap' | 'free' | 'path-array';
    targetSurface: SurfaceRef;
    uv: Vec2;                // 参数坐标，形变时自动跟随
    normalOffset: number;
  };
  weight: number;
  isEdible: boolean;
}
```

**要点：装饰物用 UV 参数坐标绑定到曲面上**，这样用户改蛋糕尺寸时，装饰会自动重新分布，而不是掉在半空——这是 CakeCAD 相比通用3D软件的核心体验优势。

---

## 三、必须有的"仿真/校验"能力（真正的差异化）

这部分是护城河。一个只会画图的工具没价值，能**告诉你这个蛋糕做不做得出来**才有价值。

### 1. 结构承重求解器

最经典的失败：多层蛋糕不打支撑柱 → 塌陷。

```
简化模型：
  对每一层 i，计算其上方所有层的总重 W_above(i)
  该层顶面承压 σ = W_above(i) / A_effective

  若 σ > σ_crush(material)  → 报警
  否则计算所需支撑柱数量：
    n = ceil( W_above / (F_dowel_max × safety_factor) )
  柱位用泊松圆盘采样布在上层投影轮廓内，避开切割线
```

材料库里给每种蛋糕胚一个**抗压强度 σ_crush**（戚风 ≈ 1–2 kPa，磅蛋糕 ≈ 8–15 kPa，慕斯需冷链且几乎不能承重）。这些参数可以做成可标定的——用户实测后回填。

**输出**：自动生成支撑柱布局图 + 中心贯穿杆建议。

### 2. 重心 / 倾覆检测

```
COM = Σ(m_i × c_i) / Σm_i
若 COM 的水平投影超出底托支撑多边形的 70% 内缩区 → 警告"运输易倒"
```

对于悬空造型（gravity-defying cake、重力蛋糕）尤其重要，还要算悬臂力矩来提示钢丝支架规格。

### 3. 热/时间约束（Chill Chain）

- 慕斯、奶油霜有**工作温度窗口**
- 系统根据装饰复杂度估算操作时长 → 提示"此设计需在15℃以下环境操作，或分3次冷藏定型"
- 生成**时间线甘特图**：烤胚(D-2) → 夹馅冷藏(D-1) → 抹面 → 装饰 → 交付

### 4. 可制造性检查（DFM for Cake）
- 最小裱花线宽 vs 裱花嘴规格
- 翻糖片最大延展面积（防裂）
- 单层直径 vs 烤盘/转台/冰箱/包装盒尺寸
- 切割份数验证：**给定人数 → 反推所需体积** （这个必须双向）

---

## 四、份数与体积的双向求解

这是B端最刚需的功能，值得单独说。

```
标准份定义：
  wedding portion  = 25 × 25 × 100 mm  (1" × 1" × 4")
  party portion    = 50 × 25 × 100 mm  (2" × 1" × 4")

对圆形层：n ≈ π×(r² - r_core²) / A_slice   （中心留柱孔）
对方形层：网格切分，直接整除
```

用户输入"要供80人吃"，系统反解出层数与直径组合（多解排序：成本最低 / 造型最佳 / 材料最少）。同时生成**切割示意图**给现场服务人员——这个PDF导出很受欢迎。

---

## 五、装饰系统：让非专业用户也能做出好看的

### 参数化裱花（Procedural Piping）

裱花本质是「**路径 × 挤出截面 × 节奏**」：

```typescript
interface PipingStroke {
  path: BSpline3D;          // 吸附在蛋糕表面上
  tip: PipingTip;           // 圆嘴/星嘴/花瓣嘴/叶子嘴（截面轮廓）
  pattern: 'shell' | 'rope' | 'ruffle' | 'rosette' | 'basketweave';
  frequency: number;        // 每单位长度的重复次数
  pressure: number;         // 影响粗细变化
  jitter: number;           // 手工感噪声 ← 很重要，太完美反而假
}
```

用 **Sweep + Blend + 噪声扰动** 生成网格。加一点 Perlin noise 让它有手工质感。

### 常用模式做成"生成器"
- **贝壳边（Shell Border）**：沿底边路径阵列，自动闭合
- **篮编（Basketweave）**：正交条带交错，自动计算行列
- **Ombre 渐变**：色彩沿高度插值
- **糖霜滴落（Drip）**：用简化流体——沿边缘生成随机长度的悬垂曲线，考虑黏度参数

### 资产库 + 语义搜索
糖花、巧克力件、蜡烛、字牌做成标准资产，带**元数据**（风格标签、颜色、尺寸、是否可食用、保质期、单价）。

---

## 六、渲染：必须"看起来能吃"

这是消费级产品的成败关键。用户不会为一个塑料感的预览下单。

**必须处理的材质**：

| 材质 | 关键渲染特性 |
|---|---|
| 奶油/淡奶油 | 强 **次表面散射 (SSS)**，微观颗粒感 |
| 翻糖 | 半哑光，轻微 SSS，表面细微纹理 |
| 镜面淋面 | 高光泽 + 清晰反射 + 内部散射 |
| 巧克力 | 各向异性高光，可可脂微反射 |
| 蛋糕切面 | 多孔结构，需要 detail normal + AO |
| 水果 | 强 SSS + 清漆层 (clearcoat) |

技术选型：**Three.js / Babylon.js + 自定义 SSS 近似**（实时用 Burley/预积分皮肤散射改造），高端预览走**云端路径追踪**出图（Blender Cycles headless 或 自研）。

场景要给**摄影棚级 HDRI 环境光**和几套预设（婚礼场景、生日场景、白背景商品图）。B端用户会直接拿渲染图当商品图用——这是巨大的价值点。

---

## 七、从设计到生产：Output 才是闭环

设计完能导出什么，决定了这个工具是玩具还是生产力工具。

**导出清单**：

1. **物料清单 BOM**
   ```
   6" 香草戚风胚      ×2      面粉 180g / 蛋 4 / 糖 120g...
   意式蛋白霜         850g
   翻糖（象牙白）     1.2kg
   糖花玫瑰（大）     ×5
   支撑柱 φ12×80mm    ×7
   -----------------------------
   食材成本  ¥ 186
   人工      4.5h × ¥60 = ¥270
   建议售价  ¥ 780  (毛利 58%)
   ```

2. **工艺工单**：分步骤图文 + 时间轴 + 每步的3D视角截图

3. **模板导出（DXF/SVG）**：
   - 翻糖包边展开图（圆锥/圆柱**可展曲面展开**）
   - 转印膜图案
   - 巧克力模具轮廓 → 直接给CNC/激光切割

4. **3D打印**：
   - 糖霜/巧克力3D打印机的 G-code（路径规划要考虑挤出流量补偿）
   - 定制蛋糕模具 STL（食品级硅胶翻模）

5. **客户确认单**：渲染图 + 尺寸 + 口味 + 过敏原声明 + 报价

---

## 八、技术栈

```
前端     Web: React + Three.js/Babylon.js + WASM几何内核
桌面     Tauri（比Electron轻）
几何内核  OpenCASCADE (WASM编译) 或 自研轻量内核
         —— 蛋糕几何比机械件简单，自研可能更划算
网格处理  CGAL / libigl (WASM)
仿真     自研简化求解器（不需要完整FEA，解析解足够）
渲染     实时: WebGL2/WebGPU;  离线: Blender headless 云渲染
后端     Rust/Go + PostgreSQL(+PostGIS风格的空间索引)
协作     CRDT (Yjs) 实现多人同步 / 客户在线批注
AI       文本/图片 → 参数化设计（见下）
```

**关于几何内核的判断**：蛋糕的几何 80% 是旋转体 + 拉伸体 + 曲面偏移 + 布尔，不需要完整的 OCCT。**自研一个基于 SDF（符号距离场）的内核可能更合适**——SDF 天然擅长表达奶油、淋面这类有机形态，布尔运算平滑过渡（smooth min）也正好模拟抹面的圆角过渡效果。最后 Marching Cubes / Dual Contouring 出网格。

---

## 九、AI 的位置（不做成噱头）

**真正有用的三个点**：

1. **图生设计**：用户上传一张 Pinterest 参考图 → 视觉模型解析出「3层 / 圆形 / 裸蛋糕 / 桉树叶装饰 / 莫兰迪粉」→ **生成可编辑的参数化文档**，而不是生成一张不可用的图。这是关键区别。

2. **文本驱动**："给我做个海洋主题的双层生日蛋糕，8岁男孩" → 调用装饰生成器组合出方案，用户再微调。

3. **配色/风格辅助**：从上传的婚礼主色、请柬图片提取色板，自动应用到设计。

**不该做的**：用扩散模型直接生成蛋糕图片。因为客户看到的图必须是**蛋糕师做得出来的**，否则就是纠纷源头。CakeCAD 的价值恰恰在于"所见即可做"。

---

## 十、实现路线图

**MVP（3个月）——先验证核心价值**
- 多层参数化蛋糕（圆/方，层数、尺寸、高度）
- 基础涂层材质（奶油/翻糖）+ 颜色
- 装饰库拖拽 + 表面吸附
- 实时PBR渲染 + 一键出图
- 份数计算 + 支撑柱自动布局
- 导出：渲染图 + BOM

**V1（+3个月）——成为生产工具**
- 参数化裱花系统
- 成本核算 + 报价单
- 工艺工单 + 时间线
- 翻糖展开图 DXF
- 客户在线确认/批注流程

**V2 ——平台化**
- 结构/热仿真完善
- 3D打印 & CNC 模具输出
- 设计模板市场（蛋糕师可售卖设计）
- 与烘焙店 POS / 订单系统集成
- AI 图生设计

---

## 十一、几个容易被忽略但很致命的点

1. **单位与地区差异**：英寸 vs 厘米，美式 wedding portion vs 中式分法，必须双制式。

2. **过敏原追踪**：材料库里带过敏原标签，自动汇总到客户确认单——这在欧美是**法律要求**（EU FIC / FDA）。

3. **运输仿真**：很多蛋糕死在车上。加一个"运输风险评分"（高度/重心/悬空件/温度），给出包装盒尺寸和固定建议。

4. **不要追求物理精确**：这不是航天CAD。σ_crush 这种参数取值区间宽、离散度大，用**保守安全系数 + 可标定**比追求精确仿真务实得多。工具要给的是"信心"，不是"证明"。

5. **色彩管理**：屏幕上的粉色 ≠ 色素调出来的粉色。要做**食用色素色卡映射**（Wilton/Americolor 等品牌色号 → 屏幕色 → 配比建议），否则客户拿到实物会失望。这个细节能建立巨大信任。

---

## 总结

**CakeCAD 的本质不是"3D建模软件"，而是"蛋糕订单的可执行规格生成器"。**

它的输入是模糊的客户需求，输出是三样东西：
- 一张**能让客户下单的美图**
- 一份**蛋糕师能照着做出来的工单**
- 一个**老板认可的成本报价**

几何建模只是中间的载体。想清楚这一点，功能优先级就非常清晰了——**渲染质量 > 参数化易用性 > 生产输出 > 仿真校验 > AI**。

如果你想深入某个方向（比如 SDF 内核怎么做、裱花的扫掠算法、SSS 渲染实现、或者商业模式），我可以展开细说。

---
**User**:

它的物料涉及到很多混合，分件，变性吧，那要用什么来管理呢，sw的文件树貌似有点不太够？那难道像剪视频一样？

---
**Assistant**:

你抓到了这个系统真正的技术核心。**SolidWorks 的树不够用，视频时间线也不够用，但你的直觉方向是对的——答案是两者的融合。**

让我先说清楚为什么 SW 树会崩。

---

## 一、为什么装配树（Assembly Tree）在这里失效

SolidWorks 的模型假设是：

> **零件是不变的原子。装配 = 把不变的原子按变换矩阵摆在一起。**

`Part` 有恒定的质量、材质、几何。`Assembly` 是引用 + 约束。这个假设在机械领域完美成立——一个 M6 螺栓昨天今天明天都是 M6 螺栓。

蛋糕里这个假设**全线崩溃**：

| 现象 | 例子 | SW 树无法表达的原因 |
|---|---|---|
| **混合 (Mixing)** | 面粉+蛋+糖 → 面糊 | 多个输入 → **单个新身份**，输入消失了 |
| **变性 (Transformation)** | 面糊 →烘烤→ 蛋糕胚 | 同一"物体"密度从 1.05 变成 0.35，体积 +80%，抗压强度从 0 变成 2kPa。**它还是同一个零件吗？** |
| **分件 (Division)** | 一个胚 →横切→ 3片 | 单个输入 → **多个新身份**，且每片都不同 |
| **不可逆 (Irreversible)** | 烤熟的不能变回面糊 | SW 的特征可以随便回滚，物理过程不行 |
| **损耗 (Yield Loss)** | 100g 面糊 → 82g 胚（水分蒸发）| 装配树里质量守恒，这里不守恒 |
| **时效性 (Perishability)** | 打发的奶油 20 分钟后塌了 | 零件没有"保质期"这个维度 |
| **状态依赖** | 巧克力 32℃ 是液体，25℃ 是固体 | 同一材料，不同状态，不同的可加工性 |

最要命的是**变性**这条。SW 的 Part 是一个静态标识符，而蛋糕里的"物料"是一个**沿时间轴改变身份的实体**。

---

## 二、正确的抽象：这不是树，是**有向无环图（DAG）**

食品制造在学术上有个成熟的模型，叫 **Process Flow / Recipe DAG**，本质上和化工的 **PFD（Process Flow Diagram）** 同源。

核心是两类节点：

```
●  Material State  （物料状态）—— 名词，某一时刻某物的快照
▢  Operation       （工序）—— 动词，把若干输入状态变成若干输出状态
```

```
面粉180g ●─┐
蛋 4个   ●─┼──▢ 搅拌 ──● 面糊 320g ──▢ 烘烤 ──● 6"胚 262g
糖 120g  ●─┤            (液态,ρ1.05)   170℃      (固态,ρ0.35)
油  60g  ●─┘                            35min     yield 82%
                                                      │
                                          ┌───────────┴──────────┐
                                       ▢ 横切(3片)
                                          │      │      │
                                          ●片1   ●片2   ●片3
                                        (顶,含皮) (中)  (底)
```

这就解决了你说的三件事：

- **混合** = 多入单出的 Operation
- **分件** = 单入多出的 Operation
- **变性** = Operation 前后的 MaterialState 拥有**不同的属性集**

**关键设计决策：Operation 的输出是全新的 MaterialState 对象，不是修改输入。** 输入状态被标记为 `consumed`，永久保留在图里作为溯源记录。这是不可逆性的自然表达。

---

## 三、数据模型

```typescript
// ── 物料状态：某个瞬间的物质快照 ────────────────────────
interface MaterialState {
  id: StateId;
  
  // 身份：它现在"是什么"
  identity: {
    name: string;              // "香草戚风胚"
    phase: 'powder'|'liquid'|'batter'|'foam'|'gel'|'solid'|'plastic';
    // plastic = 翻糖/杏仁膏这种可塑固体
  };
  
  // 量：可能不守恒
  quantity: {
    mass: number;              // g
    volume: number;            // cm³
    density: number;           // 派生
  };
  
  // 物理属性：随工序改变，供仿真使用
  physical: {
    compressiveStrength?: number;  // kPa  ← 承重计算用
    viscosity?: number;            // Pa·s ← 淋面/裱花用
    temperature: number;           // ℃
    waterActivity?: number;        // aw   ← 保质期用
    elasticModulus?: number;
  };
  
  // 几何：不是所有状态都有几何！
  geometry?: GeometryRef;      // 面糊没有几何(在盆里)，胚有几何
  
  // 时效
  temporal: {
    createdAt: TimePoint;      // 相对时间轴上的位置
    shelfLife: Duration;       // 从 createdAt 起多久失效
    stableTempRange: [number, number];
  };
  
  // 溯源与继承
  provenance: {
    producedBy: OperationId;
    ancestors: StateId[];      // 完整血统
  };
  
  // 累积属性：沿 DAG 自动汇总，不用手填
  derived: {
    allergens: Set<Allergen>;      // 从所有祖先并集
    cost: number;                  // 从所有祖先累加(含损耗分摊)
    nutrition: NutritionVector;    // 加权累加
    ingredientList: WeightedList;  // 法规要求的配料表(按含量降序)
  };
  
  consumed: boolean;           // 是否已被下游工序消耗
}


// ── 工序：状态转换算子 ──────────────────────────────────
interface Operation {
  id: OperationId;
  type: OpType;
  
  inputs:  { stateId: StateId; portion: number }[];   // portion<1 表示只用一部分
  outputs: MaterialState[];
  
  params: OpParams;            // 温度/时间/转速/切割方案...
  
  // 核心：转换函数 —— 这是整个系统的"物理引擎"
  transform: (inputs: MaterialState[], params: OpParams) => MaterialState[];
  
  // 资源与调度
  duration: Duration;
  equipment: EquipmentRef[];   // 占用哪台设备
  labor: { skill: SkillLevel; minutes: number };
  
  // 约束
  constraints: Constraint[];   // "输入必须已冷却到<30℃"
}

type OpType =
  | 'MIX' | 'WHIP' | 'FOLD'            // 混合类：多入单出
  | 'BAKE' | 'CHILL' | 'FREEZE'        // 变性类：单入单出，属性剧变
  | 'TEMPER' | 'CARAMELIZE' | 'SET'
  | 'SLICE' | 'PORTION' | 'CARVE'      // 分件类：单入多出
  | 'STACK' | 'FILL' | 'COAT'          // 组装类：多入单出，但保留子结构
  | 'PIPE' | 'DECORATE'
  | 'REST' | 'TRANSPORT';              // 无操作但消耗时间
```

---

## 四、Transform 函数：把"变性"变成可计算的

这是最有意思的部分。每种工序类型有自己的物理/经验模型：

```typescript
// 烘烤：质量↓ 体积↑ 强度 0→有 相变
transform_BAKE(input, p: {temp, minutes, humidity}) {
  const yieldRate = bakeYieldModel(input, p);   // 经验曲线，可标定 ≈0.80~0.88
  const rise = expansionModel(input.leavening, p.temp);
  
  return [{
    ...input,
    identity: { name: `${input.name}(烤制)`, phase: 'solid' },
    quantity: {
      mass:   input.mass * yieldRate,            // 失水
      volume: input.volume * rise,               // 膨胀
    },
    physical: {
      compressiveStrength: strengthModel(input.recipe, p),  // 0 → 2kPa
      temperature: p.temp,                       // 后续需 CHILL
      waterActivity: input.aw * awShift(yieldRate),
    },
    temporal: { shelfLife: shelfLifeModel(aw, storage) },
    derived: {
      allergens: input.allergens,                // 不变
      cost: input.cost,                          // 总成本不变，但单位成本↑
      nutrition: concentrate(input.nutrition, yieldRate),
    }
  }];
}

// 切分：一入多出，属性继承但几何/质量分配
transform_SLICE(input, p: {planes, kerf}) {
  const pieces = geometricSplit(input.geometry, p.planes);
  const totalV = sum(pieces.map(v => v.volume));
  
  return pieces.map((g, i) => ({
    identity: { name: `${input.name}·片${i+1}` },
    quantity: { mass: input.mass * (g.volume/totalV) },   // 按体积分摊
    physical: { ...input.physical },                       // 属性继承
    geometry: g,
    derived: {
      allergens: input.allergens,
      cost: input.cost * (g.volume/totalV),                // 成本按比例分摊
    },
    provenance: { producedBy: op.id, ancestors: [input.id] }
  }));
  // 注意：切割损耗(kerf)产生一个 waste 输出，用于成本核算
}

// 打发：质量守恒但密度剧变 + 强时效性
transform_WHIP(input, p: {minutes, speed}) {
  const overrun = overrunModel(input, p);   // 膨胀率，淡奶油可达 100~120%
  return [{
    ...input,
    identity: { phase: 'foam' },
    quantity: { mass: input.mass, volume: input.volume * (1+overrun) },
    physical: { compressiveStrength: 0.3 },   // 很弱，不能承重
    temporal: { 
      shelfLife: minutes(20),                  // ← 极短！调度器必须尊重
      stableTempRange: [0, 8] 
    },
  }];
}
```

**这些模型不需要多精确。** 用可标定的经验参数（用户实测后回填），比追求 CFD 级仿真务实一万倍。系统的价值是"给出可信区间"，不是"给出真值"。

---

## 五、回答你的核心问题：那UI怎么组织？

你说的"像剪视频一样"——**对了一半，而且是重要的一半**。

我的方案是 **三视图联动**，因为这个 DAG 有三个正交维度，任何单一视图都会丢信息：

```
┌────────────────────────────────────────────────────────────────┐
│  [结构树]        │      [3D 视口]         │   [属性/仿真]        │
│                  │                        │                     │
│ ▼ 婚礼蛋糕       │      ╱▔▔▔╲             │ 选中: 中层胚·片2    │
│   ▼ 顶层 6"      │     │ ▓▓▓ │            │ 质量 262g          │
│     ├ 胚×3       │     ╰─────╯            │ 强度 2.1 kPa       │
│     ├ 夹馅×2     │    ╱▔▔▔▔▔╲            │ 承压 1.4 kPa  ✓    │
│     └ 抹面       │   │  ▓▓▓▓  │           │ 过敏原 蛋/麸质/奶  │
│   ▼ 中层 8"      │   ╰───────╯            │ 成本 ¥12.4         │
│     ...          │  ╱▔▔▔▔▔▔▔╲           │                     │
├──────────────────┴────────────────────────┴─────────────────────┤
│  [工艺时间线]  ← 这里是"剪视频"的部分                            │
│                                                                 │
│      D-2         D-1              D0(交付日)                    │
│  ├────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤      │
│烤箱 ▓▓▓▓▓▓▓▓  ░░░░░░  ▓▓▓▓                                     │
│搅拌 ▓▓▓  ▓▓        ▓▓▓▓▓▓                                      │
│冰箱      ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                            │
│人力A ▓▓▓▓▓▓  ▓▓▓▓      ▓▓▓▓▓▓▓▓▓▓▓                            │
│                              ▲奶油打发     ▲抹面 ▲装饰 ▲交付   │
│                              └20min窗口┘                       │
└─────────────────────────────────────────────────────────────────┘
```

### 三个视图各自解决什么

**1. 结构树（Structure Tree）—— 空间维度**
- 只显示**最终态**的组装层次（BOM 视角）
- 这是 SW 树能用的部分：Tier → Layer → Decoration
- 用户日常设计时看这个，最直观
- **它是 DAG 的一个"投影"**：只保留 STACK/FILL/COAT 这类组装工序，隐藏所有制备过程

**2. 3D 视口 —— 几何维度**
- 支持**时间擦洗（Time Scrubbing）**：拖动时间轴，3D 视口显示那个时刻的状态
- D-2 看到的是烤盘里的胚，D0 看到的是成品
- 这个功能对培训新手蛋糕师价值极大

**3. 工艺时间线（Process Timeline）—— 时间维度**
- 就是你说的"剪视频"
- **轨道 = 资源**（烤箱1、烤箱2、搅拌机、冷藏柜、人力A、人力B）
- **片段 = Operation**，长度 = duration
- 依赖关系用连线表示（DAG 边）
- 拖动工序 → 自动检查依赖冲突和设备冲突

### 为什么必须要有时间线（而不是只有树）

因为蛋糕的**约束大量是时间性的**：

- 奶油打发后 20 分钟内必须用掉 → 时间线上是一个**硬窗口**
- 胚出炉后必须冷却 2h 才能抹面 → **最小间隔约束**
- 慕斯需冷藏 4h 定型 → **最小驻留时间**
- 只有 2 台烤箱 → **资源容量约束**
- 交付时间固定 → **反向排程（Backward Scheduling）**

这在树里完全无法表达。**这本质上是一个 Job-Shop Scheduling 问题**，时间线是它的自然界面。

---

## 六、别忘了第四个维度：参数化（Feature History）

这里有个容易混淆的点，必须说清楚：

**Process DAG ≠ Feature History**

| | Process DAG | Feature History |
|---|---|---|
| 描述 | 物质的真实转换 | 设计的构造步骤 |
| 可逆 | ❌ 烤了不能回退 | ✅ 随便回滚重算 |
| 类比 | 生产工单 | SW 的特征树 |

所以实际上是**双层结构**：

```
Design Layer (参数化，可回滚)
  "3层圆形蛋糕，顶层6寸，中层8寸..."
  参数改变 → 重新求解
              ↓  编译/求解
Process Layer (Process DAG，不可逆，可执行)
  "烤2个6寸胚 → 切3片 → 夹馅 → ..."
              ↓  排程
Schedule Layer (时间线 + 资源分配)
```

用户在 **Design Layer** 上工作（改尺寸、换口味、加装饰），系统自动**编译**出 Process DAG，再**排程**成时间线。

这就像编译器：源码（Design）→ IR（Process DAG）→ 机器码（Schedule）。

**用户改了"顶层从6寸改成7寸"，系统重新编译整条 DAG，重算 BOM、成本、排程、承重校验。** 这才是 CAD 该有的体验。

---

## 七、几个必须处理的脏细节

### 1. 半成品与批次（这是最大的现实复杂度）

真实厨房不会为一个蛋糕单独烤一个胚，而是：

```
一次烤 8 个 6"胚  →  订单A用 2 个
                   →  订单B用 3 个
                   →  库存 3 个（有保质期）
```

所以 MaterialState 要支持 **批次（Lot）** 概念：

```typescript
interface Lot {
  id: LotId;
  state: MaterialState;      // 属性
  totalQuantity: number;     // 批次总量
  allocations: { orderId, qty }[];   // 分配情况
  remaining: number;
  expiresAt: TimePoint;
}
```

这时候 DAG 就跨订单了，变成**共享子图**。成本要按批次分摊。这也是为什么单纯的"每个蛋糕一棵树"必然崩溃。

### 2. 替换与等价类

"没有淡奶油了，用植脂奶油代替"——需要**材料等价类**和自动的属性重算 + 影响分析（成本变了？过敏原变了？强度够吗？）：

```typescript
substitute(stateId, newMaterial) → ImpactReport {
  costDelta, allergenDelta, 
  affectedConstraints: ["顶层承重从1.2安全系数降至0.9 ⚠"]
}
```

### 3. 损耗要显式建模

每个 Operation 都可以有 `waste` 输出（切割碎屑、粘在盆上的面糊、修整边角）。不建模损耗，成本核算就是假的。行业里 5~15% 的损耗很常见。

### 4. 用 DAG 自动生成法规文件

因为 `derived.allergens` 和 `derived.ingredientList` 是沿图自动汇总的，可以**直接生成合规的配料表标签**（按含量降序、过敏原加粗）。这在欧盟/美国是硬性法律要求，手工做极易出错。这是个杀手级功能。

---

## 八、类比：这个模型在哪见过

你的直觉"像剪视频"其实指向了正确的软件范式家族：

| 领域 | 软件 | 模型 |
|---|---|---|
| 视频/合成 | Nuke, Houdini | **节点图 + 时间线** ← 最接近 |
| 化工 | Aspen Plus | 流程图（PFD）+ 单元操作 |
| 制造 | Siemens Opcenter | 工艺路线 + 排程 |
| 生物实验 | Benchling | Protocol DAG + 样本溯源 |
| 酿造 | BeerSmith | 配方 + 时间线 |

**Houdini 是最好的参照物**：它的 SOP 网络就是"数据流 DAG"，每个节点消费上游几何、产出新几何，还有 DOP 做时间相关的仿真。CakeCAD 几乎就是"**Houdini 的节点图 + Premiere 的时间线 + SolidWorks 的装配树**"三合一。

---

## 九、给用户的渐进式复杂度

DAG 很强大但对烘焙师太抽象。所以要分层暴露：

- **消费者**：只看 3D 视口，选口味/尺寸/装饰。DAG 完全隐藏。
- **蛋糕师**：主用结构树 + 3D，时间线以"待办清单"形式呈现（"今天要做：烤4个胚"）。
- **主厨/生产主管**：完整时间线 + 资源排程 + 跨订单批次视图。
- **研发/中央厨房**：直接编辑 Process DAG 节点图，调 transform 参数、标定 yield 曲线。

**默认不给节点图。** 只在"配方研发模式"下开放。

---

## 总结

> **SW 树不够，是因为它假设物料不变；视频时间线不够，是因为它没有物料转换语义。**
>
> 正确答案是 **Process DAG（物料状态 + 工序算子）** 作为底层数据模型，上面挂三个投影视图：
> - **结构树** 看空间组装（BOM）
> - **3D 视口 + 时间擦洗** 看几何演化
> - **甘特时间线** 看资源与时序约束
>
> 再在 DAG 之上加一层**参数化设计层**，实现"改尺寸→自动重算全链路"的 CAD 体验。

变性、混合、分件在这个模型里是**一等公民**（Operation 的三种基本形态：n→1、1→1属性变、1→n），而不是需要 hack 的边界情况。

要不要我展开讲讲**排程求解器**怎么做（那些时间窗口约束求解），或者 **transform 函数的经验模型标定**（怎么让用户实测数据自动回填），或者 **DAG 的增量重算**（改一个参数怎么只重算受影响的子图）？

---
**User**:

现在市面上有什么图编程相关软件吗？都分别在什么领域呢？它们怎么做的呢？包括你看simulink和aspen也不全是无环图。还有那个oop界的世纪问题，边是一等公民吗，还是只属于节点内部

---
**Assistant**:

这三个问题层层递进，而且第三个是真正的深水区。我按顺序来。

---

# 一、市面上的图编程软件全景

我按**图语义**分类，而不是按行业分——因为同一种语义会在完全不同的领域反复出现。

## 1. 数据流 DAG（Pull-based，拉取求值）

| 软件 | 领域 | 特点 |
|---|---|---|
| **Houdini SOP/VOP** | 3D程序化建模 | 节点=几何算子，惰性求值 + 依赖缓存 |
| **Nuke** | 影视合成 | 节点=图像算子，Scanline 分块拉取 |
| **Substance Designer** | 材质生成 | 全 GPU，图编译成 shader |
| **Blender Geometry Nodes** | 3D建模 | 强类型 field 系统 |
| **Grasshopper** | 建筑参数化 | Rhino 生态，push 求值 |
| **Dynamo** | BIM | Revit 生态 |
| **Unreal Material Editor** | 实时渲染 | 编译成 HLSL |
| **KNIME / Alteryx** | 数据分析 | 表格数据流 |
| **Apache Airflow / Dagster / Prefect** | 数据工程 | 任务编排 DAG |
| **TensorFlow 1.x / PyTorch FX** | 深度学习 | 计算图 + 自动微分 |
| **Bazel / Nix** | 构建系统 | 内容寻址的构建 DAG |

**核心机制**：终端节点请求结果 → 递归向上游拉取 → 缓存中间结果 → 参数变化时脏标记向下传播。

**为什么必须无环**：拉取求值遇到环会无限递归。

---

## 2. 时序/反馈系统图（有环，且环是本质）

| 软件 | 领域 | 环的意义 |
|---|---|---|
| **Simulink** | 控制系统仿真 | **反馈回路就是控制的全部** |
| **Modelica / Dymola / OpenModelica** | 多域物理系统 | 声明式方程，无方向 |
| **LabVIEW** | 测量与控制 | 数据流 + 反馈 |
| **SPICE / Cadence Virtuoso** | 电路仿真 | 基尔霍夫定律天然成环 |
| **Max/MSP, Pure Data** | 音频/交互 | 音频反馈、递归延迟 |
| **Reaktor** | 音频合成 | 滤波器反馈 |
| **VisSim, Scicos, Xcos** | 系统仿真 | 同 Simulink |

**这是你问题的关键点。** 展开讲。

---

## 3. 控制流图（有环，环=循环）

| 软件 | 领域 |
|---|---|
| **Unreal Blueprints** | 游戏逻辑（白线执行流 + 彩线数据流，**双图叠加**） |
| **Scratch / Blockly** | 教育编程 |
| **Node-RED** | IoT 消息流 |
| **n8n / Zapier / Make** | 业务自动化 |
| **LabVIEW 的 While Loop** | 显式循环结构 |
| **Camunda / BPMN** | 业务流程 |

**Blueprints 的设计非常值得学**：它把**执行顺序**（有环，白色引脚）和**数据依赖**（无环，彩色引脚）分成两张叠加的图。这是个极优雅的解法——数据流保持纯净可缓存，控制流负责时序和循环。

---

## 4. 过程/物料流图（你的 CakeCAD 属于这类）

| 软件 | 领域 | 环的来源 |
|---|---|---|
| **Aspen Plus / HYSYS** | 化工流程 | **循环物流（recycle）+ 热集成** |
| **gPROMS** | 过程建模 | 方程式 |
| **SuperPro Designer** | 生物/制药工艺 | 批次流程 + 回收 |
| **Siemens Opcenter / SAP PP** | 离散制造 | 工艺路线 + 返工回路 |
| **Benchling** | 生物实验 | 样本谱系（近似DAG） |
| **AnyLogic / Arena / FlexSim** | 离散事件仿真 | 排队网络有环 |

---

## 5. 约束/关系图（无方向）

| 软件 | 领域 |
|---|---|
| **SolidWorks/CATIA 装配约束** | 机械 CAD，配合关系是无向的 |
| **Geometric Constraint Solver** | 草图求解，双向约束 |
| **Modelica** | 声明式方程（`a + b = c` 无方向） |
| **Neo4j / RDF / OWL** | 知识图谱 |

---

## 6. 硬件/空间图（有环，环=物理连接）

| 软件 | 领域 |
|---|---|
| **Altium / KiCad** | PCB 网表（net 是超边！） |
| **AutoCAD Plant 3D / P&ID** | 管道仪表图 |
| **Revit MEP** | 建筑机电管网 |
| **EPANET / WaterGEMS** | 供水管网（环状管网是标准设计） |

---

# 二、有环怎么办？（Simulink / Aspen 到底怎么做的）

这是核心问题。**答案是：它们都不"求解"环，而是用某种方式把环消掉。**

## 方法 A：代数环检测 + 隐式求解器（Simulink）

Simulink 区分两种环：

**1. 含状态的环（合法，最常见）**

```
   ┌──────────────────────────┐
   │                          │
   ▼                          │
[Sum]──►[Gain]──►[1/s 积分器]─┴──► 输出
   ▲                    ↑
   │                这里"打断"了环
 输入
```

积分器 `1/s` 有**内部状态**，它的输出只依赖**上一时刻**的状态，不依赖当前时刻输入。所以：

```
在时刻 t：
  x(t)     ← 已知（来自上一步积分）
  y(t) = f(x(t))           ← 可以直接算
  dx/dt = g(u(t), y(t))    ← 可以直接算
  x(t+dt) = x(t) + dx/dt·dt
```

**环被"时间"打断了。** 图在**单个时间步内**退化成 DAG。

这就是关键洞察：**Simulink 的图不是 DAG，但它的每个时间步的求值图是 DAG。**

实现上，Simulink 把每个 block 分成两个"虚拟节点"：
- **Output 函数**（依赖当前输入）
- **Update 函数**（更新状态，不产生依赖边）

在 Output 图上做拓扑排序，如果排不了序 → 存在**代数环**。

**2. 代数环（真环，需要迭代求解）**

```
[Sum]──►[Gain k]──┐
   ▲              │
   └──────────────┘   没有任何延迟/积分环节
```

这时 `y = k·(u - y)` → 必须解方程。Simulink 的做法：

```
1. 用 Tarjan 算法找出强连通分量（SCC）
2. 每个 SCC 内部识别"代数环变量"
3. 对 SCC 用 Newton-Raphson / trust-region 迭代求解
4. SCC 之间仍然是 DAG，按拓扑序求解
```

或者用户手动插入 `Unit Delay (1/z)` 或 `Memory` block 强制打断（引入一步延迟）。

**这个"SCC 缩点 → DAG"是通用武器，后面还会反复出现。**

---

## 方法 B：撕裂法 / Tearing（Aspen Plus）

化工流程的环叫 **recycle stream**（循环物流），是工艺设计的核心——不循环就浪费原料。

```
       ┌────────── 循环物流 ◄───────────┐
       ▼                                │
新鲜进料 ──►[混合器]──►[反应器]──►[分离器]──┤
                                        │
                                        └──► 产品
```

Aspen 的经典算法叫 **Sequential Modular (SM)**：

```
Step 1: 找强连通分量 → 识别 recycle loop
Step 2: 撕裂 (Tearing) —— 选最少的物流"剪断"，使剩下的成为 DAG
        （最小撕裂集问题，NP-hard，用启发式：Barkley-Motard 算法）
Step 3: 猜测被撕裂物流的初值 x₀
Step 4: 沿 DAG 顺序计算一圈，得到该物流的新值 x₁
Step 5: 若 |x₁ - x₀| > ε：
          用 Wegstein / Broyden / Direct Substitution 加速
          x₀ ← 更新值，回到 Step 4
Step 6: 收敛 → 完成
```

Aspen 里那个 **Convergence Block** 就是这个迭代器的可视化体现，用户能看到"Tear Stream"和收敛历史。

**另一条路：Equation-Oriented (EO) 模式**

把整个流程展开成一个巨型非线性方程组 `F(x) = 0`（可能几十万个方程），直接扔给 Newton 法 + 稀疏线性代数求解。

- 优点：收敛快、天然支持优化和参数估计、**根本不需要区分有环无环**
- 缺点：初值敏感、调试困难、内存大

Aspen 现在两种模式都支持。gPROMS、Modelica 是纯 EO 路线。

---

## 方法 C：方程展平 + 符号化重排（Modelica）

Modelica 最激进：**它的连接根本没有方向**。

```modelica
connect(resistor.p, capacitor.p);
```

这展开成两类方程：
```
across 变量（电压）相等：  v_r = v_c
through 变量（电流）求和为零： i_r + i_c = 0     ← 基尔霍夫
```

编译器做的事：

```
1. Flattening      —— 层次模型展平成扁平方程组
2. 索引化简         —— DAE index reduction (Pantelides 算法)
                       高阶DAE → index-1，处理约束方程
3. 二分匹配         —— 方程 ↔ 未知量 的完美匹配 (Hopcroft-Karp)
4. Tarjan SCC      —— 找强连通分量
5. 块下三角化 (BLT) —— 排成块下三角矩阵
6. 代码生成         —— 小块符号求解，大块生成 Newton 迭代
```

**结果：一个无方向的方程网络，被自动排成一个 DAG-of-SCCs。** 每个 SCC 内部迭代，SCC 之间顺序求解。

这是最优雅的方案，但需要完整的符号计算引擎。

---

## 方法 D：时间展开（深度学习 / 信号处理）

RNN 有环，但 **BPTT（Backpropagation Through Time）** 把它沿时间轴展开成 DAG：

```
有环:     h ──► f ──┐
          ▲         │
          └─────────┘

展开:  h₀ ──►f──► h₁ ──►f──► h₂ ──►f──► h₃    ← DAG
```

音频 DSP 的反馈延迟线也是同理：延迟 ≥ 1 sample 就打断了环。

---

## 方法 E：不定点迭代 / 增量收敛（游戏、UI）

Unreal 的 material 不允许环。但物理引擎的约束求解（PBD、Gauss-Seidel）本质是在有环的约束图上迭代到收敛。

前端框架（React、Excel）也遇到循环引用问题：Excel 直接报错，或开启"迭代计算"选项。

---

## 小结：处理环的统一范式

```
┌─────────────────────────────────────────────────┐
│  原始图（可能有环）                                │
│         ↓                                        │
│  Tarjan 找强连通分量 (SCC)                        │
│         ↓                                        │
│  SCC 缩点 → 必然是 DAG                            │
│         ↓                                        │
│  拓扑排序 SCC                                     │
│         ↓                                        │
│  逐个求解：                                       │
│    · 单节点 SCC → 直接算                          │
│    · 多节点 SCC → 迭代求解（Newton/Wegstein/撕裂）  │
└─────────────────────────────────────────────────┘
```

**"有环图 = DAG of SCCs"** 这个定理是所有这些软件的共同数学基础。

---

## 回到 CakeCAD：需要环吗？

有意思的是——**需要，但不多**：

| 环的场景 | 处理方式 |
|---|---|
| **边角料回用**：切下的蛋糕碎 → 做棒棒糖蛋糕 | 真 recycle stream，但通常单向流到另一产品线，可当独立 DAG |
| **返工回路**：抹面不合格 → 刮掉重抹 | 消耗额外物料和时间，但**在时间轴上是单向的** |
| **老面/酸种**：留一部分做下次的种 | 真循环，但跨批次 = 跨时间，展开后是 DAG |
| **成本迭代**：售价影响用量影响成本 | 设计层的约束求解，不在 Process 层 |

**关键结论：物料 DAG 加上时间戳后，几乎总能保持无环**——因为物质流动不可逆，时间单向。这跟 Simulink 用积分器打破环是同一个道理。

所以 CakeCAD 可以放心用 DAG 做 Process 层，把有环的部分（设计约束求解）隔离在上层。

---

# 三、边是不是一等公民？

这是真正的世纪难题。我先给结论，再展开。

> **结论：边必须是一等公民（有身份、有属性、可被引用），但它不应该拥有"从/到"的语义所有权——那属于端口（Port）。**
>
> 更准确地说：**真正的一等公民是 Port，边只是 Port 之间的关系记录。**

## 三种主流架构

### 架构 A：边内嵌在节点里（Edge as Node Property）

```typescript
class Node {
  id: string;
  inputs:  Map<string, NodeId>;   // 输入槽 → 上游节点
  outputs: NodeId[];
}
```

**谁在用**：早期 Houdini、简单的 shader graph、大部分玩具实现

**优点**：结构简单，遍历快，天然保证一致性

**致命缺陷**：
- 边没有身份 → 无法给边加属性（权重、条件、标签、可视化样式）
- 无法表达"同一条边被多处引用"
- 多输出/多输入的映射关系表达困难
- 撤销/重做时边的身份丢失

**判决：只适合最简单的场景。CakeCAD 绝对不能用。**

---

### 架构 B：边是独立实体（Edge as First-Class Entity）

```typescript
class Edge {
  id: EdgeId;
  source: { node: NodeId, port: PortId };
  target: { node: NodeId, port: PortId };
  
  // 边自己的属性 ← 关键价值
  properties: {
    label?: string;
    condition?: Expression;      // 条件边
    weight?: number;
    transferFunction?: Fn;       // 边上的变换
  };
}

class Graph {
  nodes: Map<NodeId, Node>;
  edges: Map<EdgeId, Edge>;
  
  // 索引（派生数据，用于加速）
  private outgoing: Map<NodeId, EdgeId[]>;
  private incoming: Map<NodeId, EdgeId[]>;
}
```

**谁在用**：Simulink、Aspen、Neo4j、大多数正经的图编辑器

**优点**：
- 边可以有属性、有身份、可选中、可注释
- 可以在边上挂数据（Aspen 的 Stream 就是有属性的边！）
- 撤销/重做、协同编辑、版本控制都干净

**代价**：需要维护索引一致性，删节点要级联删边

---

### 架构 C：端口是一等公民，边是端口的连接（Port-Centric）★

```typescript
class Port {
  id: PortId;
  owner: NodeId;
  direction: 'in' | 'out' | 'bidirectional';
  dataType: TypeDescriptor;
  
  cardinality: {
    min: number;
    max: number | 'unbounded';   // 输入通常max=1，输出unbounded
  };
  
  defaultValue?: any;             // 未连接时的值
}

class Connection {
  id: ConnectionId;
  from: PortId;
  to: PortId;
  // 可以有属性，但语义很薄
}

class Node {
  id: NodeId;
  type: NodeType;
  ports: PortId[];               // 端口可以是动态的！
  params: Record<string, any>;
}
```

**谁在用**：Unreal Blueprints、Nuke、Blender Nodes、LabVIEW、KiCad

**为什么这是最优解**：

1. **类型检查的归属地**：类型属于端口，不属于边。连线时检查 `from.type` 是否兼容 `to.type`。

2. **基数约束**：一个输入端口通常只能接一条线，输出端口可以接多条。这个约束是端口的属性，不是边的。

3. **动态端口**：Aspen 的混合器可以加任意多进料口，Houdini 的 Merge 节点端口数动态变化。端口作为实体才能建模这个。

4. **未连接语义**：端口未连接时用默认值。边不存在时，端口仍然存在并有意义。

5. **UI 命中检测**：用户点的是端口（小圆点），拖出来才是边。

---

## 但真正的深水区：边到底是"引用"还是"实体"？

这里有个哲学分歧，取决于**边承载多少语义**：

### 情况 1：边是纯粹的引用（Reference Edge）

Houdini、Nuke、Blender 的数据流边：**边不携带任何东西，只表示"数据从这里流到那里"**。

数据在**节点上**计算和缓存，边只是箭头。

```
Node.compute() 的伪码：
  inputs = ports.filter(in).map(p => p.connection?.from.owner.cachedResult)
  result = transform(inputs, params)
  cache[this] = result
```

**这时边确实可以很"薄"**，甚至可以争论它不需要是一等公民。

### 情况 2：边是实体（Substantive Edge）

Simulink 的 signal、Aspen 的 Material Stream、KiCad 的 Net、CakeCAD 的 MaterialState：

**边本身就是被建模的对象！**

- Aspen 的 Stream 有温度、压力、组成、流量、焓 —— 它是化工计算的核心数据
- Simulink 的 signal 有维度、数据类型、采样时间、总线结构
- CakeCAD 的边就是 **MaterialState**（面糊 320g，密度 1.05，含过敏原...）

**这时边绝对必须是一等公民，而且它比节点还重要。**

---

## 关键洞察：这时该反转视角

如果边承载数据，节点承载变换——那么这**本质上是二分图（Bipartite Graph）**：

```
传统视角：              二分图视角：
                        
[混合]──面糊──►[烘烤]    ●面粉 ─┐
                        ●蛋   ─┼─►▢混合──►●面糊──►▢烘烤──►●蛋糕胚
                        ●糖   ─┘

节点=操作，边=物料        两类节点：● State  ▢ Operation
                        边=纯粹的连接关系，无属性
```

**这正是我上一轮给你的 CakeCAD 模型！**

`MaterialState` 和 `Operation` 都是节点，边退化成纯粹的关联。这样：
- MaterialState 可以被多个 Operation 消费（分叉）
- MaterialState 有完整身份、属性、溯源、批次
- 边真的可以很薄

**这个叫 Petri 网**（Place-Transition Net），是过程建模的标准数学模型。SuperPro Designer、Camunda、很多 MES 系统底层都是 Petri 网。

**同样的现象在别处也有**：
- 编译器的 SSA 形式：value 是一等公民，指令消费和产生 value
- KiCad 的 Net：不是"边"，而是一个**独立实体**连接多个引脚（超边）
- 数据库的多对多关系：中间表就是把边提升为实体

---

## 我的建议架构（CakeCAD）

```typescript
// ══ 三种实体，都是一等公民 ══

class MaterialState {          // "边"被提升为节点
  id: StateId;
  identity, quantity, physical, geometry, temporal, derived;
  
  producedBy: OperationId | null;    // 单一来源
  consumedBy: OperationId[];         // 可被多个消费（分配到不同订单）
}

class Operation {
  id: OperationId;
  type: OpType;
  params: OpParams;
  duration, equipment, labor;
  
  inputPorts:  Port[];    // 有语义的口：'干性材料' / '湿性材料' / '主料'
  outputPorts: Port[];    // '产品' / '废料' / '副产品'
}

class Port {                   // 端口是一等公民
  id: PortId;
  owner: OperationId;
  role: string;              // 语义角色，不只是索引
  direction: 'in' | 'out';
  accepts: TypeConstraint;   // 只接受 phase='liquid' 的物料
  cardinality: [min, max];
}

class Flow {                   // 边很薄，但仍有身份
  id: FlowId;
  state: StateId;
  port: PortId;
  portion: number;           // 0~1，只用这个state的一部分
  // 唯一的实质属性：分配比例
}
```

**为什么 Flow 仍需要 id**：
- 撤销/重做需要稳定标识
- 协同编辑的 CRDT 需要
- 用户可以选中一条流并标注（"这批面糊质量存疑"）
- `portion` 属性必须挂在边上（同一批物料分给不同订单）

---

## 决策表

| 你的场景 | 推荐架构 |
|---|---|
| 纯数据流，边只是箭头 | Port-centric，边薄（B/C） |
| 边有属性（权重、条件、标签） | 边一等公民（B） |
| **边承载被建模的实体**（物料、信号、网络） | **二分图/Petri网，把边提升为节点（C+）** |
| 需要超边（一根线连多个点） | 必须提升为节点（KiCad Net 模式） |
| 需要协同编辑/版本控制 | 一切都要有稳定 ID |

---

## 一个常被忽略的坑：图的存储与索引分离

无论选哪种架构，**都要把"真相"和"索引"分开**：

```typescript
class Graph {
  // ── 真相（Source of Truth）：可序列化，可 diff ──
  private _nodes: Map<NodeId, Node>;
  private _edges: Map<EdgeId, Edge>;
  
  // ── 派生索引（Derived）：可随时重建，不参与序列化 ──
  private _adjacency: Map<NodeId, EdgeId[]>;
  private _topoOrder: NodeId[] | null;      // 懒计算，脏时失效
  private _sccs: SCC[] | null;
  private _dirtySet: Set<NodeId>;
  
  // 任何修改都要 invalidate 索引
  addEdge(e: Edge) {
    this._edges.set(e.id, e);
    this._invalidateTopo();
    this._markDirtyDownstream(e.target.node);
  }
}
```

**这是 Houdini、Nuke 性能的秘密**：拓扑序、SCC 分解、依赖闭包都是懒计算 + 缓存的。

---

# 总结

**1. 图编程软件的语义分类**（比行业分类更本质）：
数据流DAG / 时序反馈 / 控制流 / 过程物料流 / 约束关系 / 空间网络

**2. 有环怎么办**：所有软件的统一答案是 **Tarjan SCC 缩点 → DAG of SCCs → 拓扑序求解，SCC内部迭代**。具体手段：
- Simulink：状态变量打破环（时间延迟），代数环用 Newton 迭代
- Aspen SM：撕裂 + Wegstein 加速；EO：整体 Newton
- Modelica：符号化 BLT 分解，最优雅
- RNN：沿时间展开

**3. 边是不是一等公民**：
- 问错了问题。**真正的一等公民是 Port**（类型、基数、默认值都属于端口）
- 如果**边只是箭头** → 可以薄，但仍要有 ID（为了撤销/协同）
- 如果**边承载实体**（物料流、信号、网络）→ 应该把边**提升为节点**，变成二分图/Petri网
- **CakeCAD 属于后者**，所以 `MaterialState` 是节点而不是边，这不是妥协，是正确建模

最后一句话：**当你发现"边好像需要很多属性"的时候，那说明你的边其实是个名词，应该变成节点。** 这是图建模里最有用的一条经验法则。

---
