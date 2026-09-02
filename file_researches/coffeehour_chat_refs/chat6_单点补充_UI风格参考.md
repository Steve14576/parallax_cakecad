ai一键生成的，从真实图片导出的，有原图，布局不一定对，但是美学风格很好。
# CakeCAD — UI 设计文字稿

## 一、整体设计风格

- **主题**：深色专业工具风（近黑色背景），搭配橙色/琥珀色强调色
- **字体**：界面文字以等宽/窄体无衬线为主，带 HUD（科幻仪表）质感
- **布局结构**：顶部栏 → 视口控制条 → 左侧工具栏 + 中央 3D 视口 + 右侧属性面板 → 底部时间轴 + 命令行 → 状态栏
- **中央视口**：黑森林蛋糕 3D 模型（切去一角展示截面层次），带变换包围盒、控制手柄与网格地面

---

## 二、顶部栏（Top Bar）

| 区域 | 内容 |
|---|---|
| 左 | Logo「CakeCAD」；标语 `CAKE IS A LAYER OF POSSIBILITIES`；版本号 `v1.0.0 PRO` |
| 中左 | `PROJECT: Black Forest` ／ `MODE: Model` |
| 中 | 选项卡导航：**MODEL**（当前激活，橙色下划线）、SCULPT、DECORATE、RENDER、ANIMATE、EXPORT |
| 右 | `LIVE SYNC / OFFLINE` 状态指示（红点）；时间 `16:42:17`；`SYS: NOMINAL`；用户头像 |

---

## 三、视口控制条（Viewport Bar）

- 坐标信息：`LAT 34.0522° N` ｜ `LON 118.2437° W` ｜ `ALT 89.0 m`
- 视图切换：**PERSPECTIVE**（激活）、TOP、FRONT、RIGHT
- `CAMERA ▾` 下拉菜单

---

## 四、左侧工具栏（Toolbar，竖排图标 + 文字）

依次排列：＋（新建）、SELECT、MOVE、ROTATE、SCALE、EXTRUDE、BEVEL、SMOOTH、SLICE、BOOLEAN、ARRAY、MIRROR、DETAIL、DECAL、TEXTURE、MEASURE

---

## 五、右侧属性面板

**STATS（统计）**
- VERTICES：12,746 ｜ EDGES：25,980 ｜ FACES：13,256
- TRIS：25,472 ｜ UV SETS：2 ｜ MATERIALS：8

**LAYER INFO（图层信息）**
- 当前层：Chocolate Sponge
- Visible（眼睛图标开关）、Lock（锁图标开关）、Opacity：100%

**TRANSFORM（变换）**
- Position：X 0.000 / Y 0.000 / Z 0.000（m）
- Rotation：X 0.00° / Y 0.00° / Z 0.00°
- Scale：X 1.000 / Y 1.000 / Z 1.000

---

## 六、右上文档面板（CAKE MARKDOWN）

富文本工具栏：B（粗体）、I（斜体）、H（标题）、代码、引用、列表等图标

```markdown
# Black Forest Cake
A classic German dessert consisting of chocolate
sponge layers, whipped cream, and cherries.

## Layers
- Chocolate Sponge
- Cherry Filling
- Whipped Cream
- Chocolate Shavings
- Cherry Top

## Parameters
| Name            | Value | Unit |
|-----------------|-------|------|
| Diameter        | 20    | cm   |
| Height          | 12    | cm   |
| Layers          | 4     | -    |
| Cream Thickness | 2     | cm   |

## Notes
- Use high quality dark chocolate.
- Chill for best taste.
```

---

## 七、底部时间轴（CAKE DAW）

- 走带控制：快退 / 播放 / 快进 / 循环等
- 时间码 `00:01:24:15` ｜ `120.00` ｜ `4/4`
- 时间标尺：00:00:00 → 00:03:00（每 15 秒一刻度）
- 轨道列表（每条轨道含剪辑块与关键帧菱形点）：
  1. Cream Layer
  2. Cherry Filling
  3. Sponge Layer
  4. Chocolate Shavings
  5. Cherry Top
  6. Plate
  7. Camera
  8. Light 001
  9. Light 002

---

## 八、右下命令行（CAKE CMD）

```
CakeCAD Command Line Interface
Type 'help' for available commands.

CakeCAD> load_project "Black Forest.cake"
Project loaded successfully.

CakeCAD> set_layer_visible "Cherry Filling" true
OK

CakeCAD> export --format gltf --output cake.gltf
Export completed.

CakeCAD> ▊
```

---

## 九、状态栏（Status Bar）

- 左：`STATUS: READY`
- 右：`CAKECAD` 标识

---

如需，我可以进一步输出：**① 前端还原用的布局标注稿（含间距/栅格建议）**、**② 设计规范（色板、字号层级）**、或 **③ 英文版完整文案**。

---
**User**:

前端视觉语言美学风格稿+功能区划分稿

---
**Assistant**:

> **Planning visual language and zoning**

# CakeCAD 前端视觉语言美学风格稿  
## —— Dark Technical / Edible Engineering

---

## 一、视觉定位

### 1. 产品气质

CakeCAD 是一款融合 **3D 建模、蛋糕结构设计、材质编辑、动画编排与参数化文档** 的专业创作工具。

整体视觉应传达：

- 专业
- 精密
- 高级
- 科幻
- 工程化
- 具有烘焙与巧克力质感
- 面向专业创作者，而非普通消费级用户

### 2. 核心美学关键词

> **暗黑工作台 × 琥珀灯光 × 工业仪表 × 数字甜点**

视觉上不采用常见的明亮、柔和、卡通化烘焙风格，而是将蛋糕视为一种可以被拆解、建模、测量和编排的复杂结构。

### 3. 推荐风格命名

- Dark Patisserie Lab
- Edible Engineering
- Black Amber CAD
- Dessert Industrial Interface
- Cake Assembly System

中文可称为：

> **暗黑甜点工程风**  
> **琥珀色数字烘焙实验室**

---

# 二、视觉语言体系

## 1. 色彩系统

### 1.1 基础背景色

| 色彩 | 用途 | 建议色值 |
|---|---|---|
| 深黑背景 | 全局背景 | `#080909` |
| 主工作区 | 视口底色 | `#0D0E0E` |
| 面板背景 | 侧栏、弹窗 | `#111211` |
| 浮层背景 | 菜单、Tooltip | `#171817` |
| 分割线 | 区域边界 | `#292522` |
| 弱边框 | 面板轮廓 | `#3A3029` |

整体背景保持接近黑色，但不建议使用纯黑，以便区分层级并保留界面细节。

### 1.2 品牌与强调色

| 色彩 | 用途 | 建议色值 |
|---|---|---|
| 主琥珀色 | 主按钮、选中状态、关键线条 | `#C66B2C` |
| 高亮橙色 | Hover、选中对象、关键帧 | `#F08A3C` |
| 暗铜色 | 辅助边框、时间轴轨道 | `#704022` |
| 金色 | 成功状态、重要提示 | `#D99A42` |
| 深红色 | 警告、录制、错误操作 | `#A34232` |
| 冷灰色 | 次级信息、禁用状态 | `#747574` |

强调色不宜大面积铺设，应集中用于：

- 当前模式
- 选中模型
- 活跃工具
- 关键按钮
- 时间轴播放头
- 参数修改状态
- 可交互边界

### 1.3 模型材质色

模型区域可以使用更丰富的暖色，但界面控件保持克制。

| 材质 | 建议色调 |
|---|---|
| 巧克力 | 深棕、黑棕、微红棕 |
| 奶油 | 暖白、米色、浅灰黄 |
| 樱桃 | 深红、暗红、紫红 |
| 金属托盘 | 深灰、枪灰、铜色 |
| 光照高光 | 暖橙、琥珀、柔金 |

---

## 2. 字体语言

### 2.1 字体方向

推荐使用：

- 英文：`IBM Plex Mono`、`Roboto Mono`、`JetBrains Mono`
- 中文：`Noto Sans SC`、`思源黑体`
- 数值与代码：优先使用等宽字体

### 2.2 字体层级

| 层级 | 使用场景 | 建议字号 |
|---|---|---|
| H1 | 页面标题、项目名称 | 18–22px |
| H2 | 面板标题 | 12–14px |
| Body | 普通说明文字 | 12px |
| Caption | 辅助标签、状态 | 10–11px |
| Data | 数值、坐标、参数 | 11–12px 等宽 |
| Micro | 状态角标、单位 | 9–10px |

### 2.3 文案风格

界面文案应保持：

- 简短
- 工程化
- 直接
- 低情绪化
- 以名词和动作动词为主

推荐：

- `CREATE LAYER`
- `APPLY MATERIAL`
- `SET VISIBILITY`
- `EXPORT MODEL`
- `CAMERA ACTIVE`
- `STATUS: READY`

不建议：

- “马上开始制作你的美味蛋糕吧”
- “哇，这个效果太棒了”
- “一键打造专属甜点”

---

## 3. 图标语言

### 3.1 图标风格

- 线性图标
- 单色图标
- 细线、窄体
- 统一 1px 或 1.5px 描边
- 尽量避免复杂填充图标
- 关键状态使用橙色或红色点亮

### 3.2 图标状态

#### 默认状态

- 灰白色
- 低对比度
- 不干扰中央模型

#### Hover 状态

- 橙色描边
- 显示工具名称 Tooltip
- 可增加轻微背景块

#### Active 状态

- 橙色图标
- 橙色左边框或底边框
- 背景使用低透明度橙色

#### Disabled 状态

- 深灰色
- 透明度约 35%–45%
- 不显示高亮反馈

---

## 4. 边框与分割线

### 4.1 面板边界

- 使用细边框，而不是厚重卡片阴影
- 面板边框颜色：`#322923`
- 重点面板可使用琥珀色顶部线或左侧线

### 4.2 分隔方式

优先级：

1. 细线分隔
2. 留白分隔
3. 背景层级分隔
4. 轻微发光分隔

不建议大量使用圆角卡片。整体更接近专业软件、控制台和工作站。

### 4.3 圆角规则

| 元素 | 圆角 |
|---|---|
| 顶部导航 | 0–4px |
| 面板 | 2–6px |
| 按钮 | 2–4px |
| 输入框 | 2px |
| Tooltip | 3px |
| 弹窗 | 6px |

---

## 5. 光效与阴影

### 5.1 光效原则

光效用于表达状态，不用于装饰。

可使用：

- 橙色边缘发光
- 选中模型轮廓光
- 播放头发光
- 录制状态红点闪烁
- 导出完成的绿色/金色提示光

### 5.2 阴影原则

采用低扩散、低透明度阴影：

```css
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.42);
```

避免高亮、柔和、消费级 SaaS 风格的大面积投影。

---

# 三、界面空间语言

## 1. 布局气质

整体布局为：

> **顶部模式导航 + 中央沉浸式视口 + 两侧控制面板 + 底部时间轴**

核心视觉权重：

1. 中央 3D 模型
2. 顶部模式导航
3. 左侧建模工具
4. 右侧属性与文档
5. 底部动画时间轴
6. 命令行与状态栏

中央工作区应始终是视觉中心。

---

## 2. 推荐页面比例

以 1440 × 900 屏幕为基准：

| 区域 | 推荐尺寸 |
|---|---|
| 顶部导航 | 72px |
| 视口控制条 | 36px |
| 左侧工具栏 | 64px |
| 右侧属性区 | 300–360px |
| 底部时间轴 | 220–260px |
| 底部状态栏 | 24px |

中央视口占据主要面积，建议保持全页面约 55%–65% 的视觉宽度。

---

# 四、交互反馈语言

## 1. 选中模型

表现方式：

- 模型外围显示橙色包围盒
- 控制点使用橙色圆点或方点
- 当前选中层显示名称标签
- 右侧属性面板同步更新
- 视口底部显示当前对象信息

示例：

```text
SELECTED: CHOCOLATE SPONGE
OBJECT ID: LAYER_003
```

## 2. 参数修改

当用户修改尺寸、旋转、透明度等参数时：

- 参数值短暂变为橙色
- 输入框右侧显示“已修改”状态
- 可显示 Undo 提示
- 数值变化可同步反映到 3D 模型

## 3. 加载状态

推荐使用：

- 环形细线进度
- 橙色扫描线
- `LOADING MODEL`
- `SYNCING MATERIAL`
- `BUILDING LAYER`

不建议使用大型卡通 Loading 动画。

## 4. 成功状态

使用低调的状态提示：

```text
MODEL EXPORTED
PROJECT SAVED
LAYER APPLIED
SYNC COMPLETE
```

提示位置优先为右下角或底部状态栏。

## 5. 错误状态

错误信息应明确说明原因及操作建议：

```text
EXPORT FAILED
Missing material: Cherry_Top
Action: Assign a valid material and retry.
```

---

# 五、功能区划分稿

## 一、一级功能结构

CakeCAD 建议划分为以下六大工作模式：

1. **MODEL｜建模**
2. **SCULPT｜雕刻**
3. **DECORATE｜装饰**
4. **RENDER｜渲染**
5. **ANIMATE｜动画**
6. **EXPORT｜导出**

顶部导航用于切换一级工作模式。

---

# 二、整体功能架构

```text
CakeCAD
├── Project 项目管理
│   ├── 新建项目
│   ├── 打开项目
│   ├── 保存项目
│   ├── 自动保存
│   ├── 项目版本
│   └── 协作同步
│
├── Model 建模
│   ├── 基础形体
│   ├── 蛋糕层级
│   ├── 切割与布尔
│   ├── 尺寸与比例
│   ├── 变换
│   └── 对象管理
│
├── Sculpt 雕刻
│   ├── 平滑
│   ├── 推拉
│   ├── 刮削
│   ├── 修边
│   ├── 表面细节
│   └── 形态修复
│
├── Decorate 装饰
│   ├── 奶油
│   ├── 水果
│   ├── 巧克力碎屑
│   ├── 糖霜
│   ├── 装饰排布
│   └── 装饰模板
│
├── Render 渲染
│   ├── 材质
│   ├── 灯光
│   ├── 相机
│   ├── 背景
│   └── 输出预览
│
├── Animate 动画
│   ├── 时间轴
│   ├── 关键帧
│   ├── 对象动画
│   ├── 相机动画
│   ├── 灯光动画
│   └── 播放控制
│
└── Export 导出
    ├── 图片
    ├── 视频
    ├── 3D 模型
    ├── 项目文件
    ├── Markdown 文档
    └── 参数报告
```

---

# 三、页面功能分区

## 1. 顶部导航区

### 主要职责

- 切换工作模式
- 显示当前项目
- 显示当前编辑状态
- 控制实时同步
- 显示系统状态与账户信息

### 功能内容

```text
[Logo]
[Project Name]
[Mode]
[MODEL] [SCULPT] [DECORATE] [RENDER] [ANIMATE] [EXPORT]
[Live Sync] [Time] [System Status] [Profile]
```

### 状态规则

- 当前模式使用橙色下划线
- 未保存时项目名称旁显示 `*`
- 同步失败时显示红色状态点
- 导出或渲染中时显示任务状态

---

## 2. 左侧工具区

### 主要职责

- 提供高频编辑工具
- 支持对象选择与几何操作
- 保持固定位置，便于快速操作

### 工具分类

#### 选择类

- Select
- Multi-select
- Lasso Select
- Isolate

#### 变换类

- Move
- Rotate
- Scale
- Align
- Mirror

#### 建模类

- Extrude
- Bevel
- Slice
- Boolean
- Array

#### 表面类

- Smooth
- Detail
- Texture
- Decal

#### 辅助类

- Measure
- Annotate
- Guide
- Reset View

### 建议交互

- 图标为主，文字为辅
- Hover 时显示英文名称与快捷键
- 工具切换后，顶部或视口左上角显示当前工具
- 当前工具图标高亮为橙色

---

## 3. 中央 3D 视口区

### 主要职责

- 显示和编辑蛋糕模型
- 进行视角、选择、变换与实时预览
- 作为全产品的核心工作区域

### 功能模块

#### 视图控制

- Perspective
- Top
- Front
- Right
- Camera View
- Orbit
- Pan
- Zoom
- Frame Selected

#### 场景辅助

- 网格
- 坐标轴
- 尺寸标尺
- 包围盒
- 对称轴
- 参考线
- 地面圆盘
- 视口灯光

#### 模型编辑

- 选择模型
- 拖拽变换
- 截面查看
- 图层隐藏
- 材质预览
- 局部隔离

### 视口叠加信息

左上角：

```text
VIEW: PERSPECTIVE
OBJECTS: 08
SELECTED: CHOCOLATE SPONGE
```

右上角：

```text
FPS: 60
VERTICES: 12,746
```

---

## 4. 右侧属性区

右侧区域建议采用纵向可折叠面板。

### 面板一：Stats

显示当前场景或当前对象的结构数据：

- Vertices
- Edges
- Faces
- Tris
- UV Sets
- Materials

适用对象：

- 3D 模型优化
- 性能监控
- 导出前检查

### 面板二：Layer Info

显示当前对象所在图层：

- 图层名称
- 显示/隐藏
- 锁定/解锁
- 透明度
- 材质缩略图
- 父级关系

### 面板三：Transform

编辑对象基础参数：

- Position
- Rotation
- Scale
- Dimensions
- Origin
- Pivot

### 面板四：Material

建议增加：

- Material Name
- Base Color
- Roughness
- Specular
- Subsurface
- Texture
- Preview

### 面板五：Modifiers

显示当前对象附加效果：

- Smooth
- Bevel
- Displace
- Array
- Boolean
- Mirror

---

## 5. 文档与参数区

右上角的 `Cake Markdown` 是产品的特色功能区，建议定位为：

> **模型说明文档 + 参数化设计文档 + 配方结构说明**

### 主要功能

- 编写蛋糕名称与介绍
- 描述层级结构
- 记录尺寸和配方参数
- 添加制作备注
- 插入表格
- 插入模型参数
- 从模型自动生成 Markdown

### 与模型的联动

例如用户修改：

```text
Diameter: 20 cm → 22 cm
Layers: 4 → 5
```

文档中的参数表同步更新。

也可以从文档反向修改模型参数。

---

## 6. 底部时间轴区

### 主要职责

- 管理动画和场景变化
- 编排蛋糕层级出现顺序
- 控制相机、灯光和材质变化
- 支持关键帧编辑

### 时间轴轨道

#### 模型层轨道

- Cream Layer
- Cherry Filling
- Sponge Layer
- Chocolate Shavings
- Cherry Top

#### 场景轨道

- Plate
- Camera
- Light 001
- Light 002

### 时间轴功能

- 播放/暂停
- 快进/后退
- 循环播放
- 添加关键帧
- 删除关键帧
- 缩放时间轴
- 吸附关键帧
- 轨道锁定
- 轨道隐藏
- 轨道重命名

### 关键帧颜色建议

| 类型 | 颜色 |
|---|---|
| 模型位置 | 橙色 |
| 材质变化 | 紫红色 |
| 灯光 | 黄色 |
| 相机 | 蓝灰色 |
| 可见性 | 深红色 |

---

## 7. 右下命令行区

### 功能定位

面向高级用户与批处理场景。

### 支持功能

- 项目加载
- 图层显隐
- 参数修改
- 批量生成
- 模型导出
- 脚本执行
- 自动化操作

### 命令示例

```text
load_project "Black Forest.cake"
set_layer_visible "Cherry Filling" true
set_parameter diameter 20
apply_material "Dark Chocolate"
export --format gltf --output cake.gltf
```

### 交互要求

- 支持命令历史
- 支持 Tab 补全
- 支持错误提示
- 支持复制输出
- 支持命令结果状态色
- 允许折叠与展开

---

## 8. 底部状态栏

### 显示内容

左侧：

```text
STATUS: READY
```

中部：

```text
Object: Chocolate Sponge
Vertices: 12,746
Memory: 1.2 GB
```

右侧：

```text
Units: CM
Grid: ON
Snap: ON
CakeCAD
```

### 状态类型

- `READY`：待机
- `EDITING`：编辑中
- `SAVING`：保存中
- `SYNCING`：同步中
- `RENDERING`：渲染中
- `EXPORTING`：导出中
- `ERROR`：错误

---

# 六、不同工作模式下的功能变化

## MODEL｜建模模式

重点突出：

- 左侧几何工具
- 中央模型视口
- 右侧 Transform、Layer、Stats
- 底部对象轨道

适用操作：

- 创建蛋糕主体
- 设置尺寸
- 创建蛋糕层
- 切割、堆叠、复制
- 调整模型结构

---

## SCULPT｜雕刻模式

重点突出：

- 笔刷工具
- 笔刷大小、强度、平滑度
- 局部细节预览
- 历史记录

新增面板：

```text
BRUSH
Size
Strength
Falloff
Smoothing
Symmetry
```

---

## DECORATE｜装饰模式

重点突出：

- 奶油、樱桃、巧克力等素材库
- 装饰位置与阵列工具
- 装饰模板
- 快速复制与环形排布

新增功能：

- `Place Cherry`
- `Pipe Cream`
- `Scatter Shavings`
- `Create Pattern`
- `Radial Array`

---

## RENDER｜渲染模式

重点突出：

- 材质球
- 灯光预览
- 相机设置
- 渲染质量
- 实时画面

新增面板：

```text
RENDER SETTINGS
Engine
Quality
Samples
Resolution
Background
Output Format
```

---

## ANIMATE｜动画模式

重点突出：

- 时间轴
- 关键帧
- 相机和灯光轨道
- 播放控制
- 动画预览

主要动作：

- 蛋糕层逐层生成
- 镜头环绕
- 奶油挤出动画
- 樱桃落位
- 灯光渐变
- 切面展示动画

---

## EXPORT｜导出模式

重点突出：

- 导出格式
- 输出尺寸
- 质量设置
- 文件路径
- 导出预览
- 任务队列

支持格式：

- PNG
- JPG
- WebP
- MP4
- GLTF
- OBJ
- FBX
- STL
- Markdown
- JSON 参数文件

---

# 七、信息优先级原则

## 一级信息：必须始终可见

- 当前项目名称
- 当前工作模式
- 当前选中对象
- 中央 3D 模型
- 模型交互状态
- 系统状态

## 二级信息：根据工作模式展示

- 变换参数
- 材质参数
- 时间轴
- 渲染设置
- 图层信息
- 对象统计

## 三级信息：按需展开

- 高级属性
- 命令行
- 调试信息
- 面数统计
- UV 信息
- 导出日志

---

# 八、界面设计原则总结

1. **模型永远是视觉中心**  
   控制面板不应抢夺中央视口注意力。

2. **橙色只表达重点**  
   不将所有按钮和标签都染成橙色。

3. **数据可读优先于装饰**  
   参数、坐标、时间码和状态信息要清晰准确。

4. **专业感来自秩序**  
   通过网格、等宽字体、细边框和严谨间距建立专业感。

5. **甜点感来自材质，不来自卡通元素**  
   使用巧克力、奶油、樱桃的材质和暖色光照表达产品主题。

6. **所有操作都要有状态反馈**  
   选中、锁定、隐藏、修改、保存、同步和导出都需要明确反馈。

7. **默认克制，细节发光**  
   页面整体保持暗和静，重要对象和操作在关键时刻被点亮。

---

## 最终风格一句话

> CakeCAD 应呈现为一间隐藏在黑暗中的数字甜点实验室：模型像艺术品，参数像工程数据，橙色光线像烤箱与控制台的余温。

---
