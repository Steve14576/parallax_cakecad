import { useEffect, useMemo, useRef, useState } from "react";
import type { CakeObject, ProjectCommand, ProjectSnapshot } from "@cakecad/contracts";
import { loadProject, sendCommand } from "./api";

type ContextMenu = {
  objectId: string;
  x: number;
  y: number;
} | null;

const roleLabels: Record<CakeObject["role"], string> = {
  material: "物料",
  container: "容器",
  tool: "工具",
  device: "设备",
  intermediate: "中间体",
};

export function App() {
  const [project, setProject] = useState<ProjectSnapshot | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [laneMode, setLaneMode] = useState<"hot" | "cold">("hot");
  const [contextMenu, setContextMenu] = useState<ContextMenu>(null);
  const [commandText, setCommandText] = useState("");
  const [message, setMessage] = useState("正在连接本地核心…");
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProject()
      .then((snapshot) => {
        setProject(snapshot);
        setMessage("本地核心已连接");
      })
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "连接失败"));
  }, []);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const selected = useMemo(
    () => project?.objects.find(({ id }) => id === selectedId) ?? null,
    [project, selectedId],
  );

  async function execute(command: ProjectCommand) {
    try {
      setProject(await sendCommand(command));
      setMessage(`已写入本地事实 · ${command.type}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "命令失败");
    }
  }

  function onDragStart(event: React.DragEvent, objectId: string) {
    event.dataTransfer.setData("text/cakecad-object", objectId);
    setSelectedId(objectId);
    setContextMenu(null);
  }

  function onCanvasDrop(event: React.DragEvent) {
    event.preventDefault();
    const objectId = event.dataTransfer.getData("text/cakecad-object");
    const canvas = canvasRef.current;
    if (!objectId || !canvas || !project) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(8, Math.min(event.clientX - rect.left - 54, rect.width - 122));
    const y = Math.max(8, Math.min(event.clientY - rect.top - 28, rect.height - 68));
    void execute({ type: "moveObject", objectId, x, y });
  }

  function openContextMenu(event: React.MouseEvent, objectId: string) {
    event.preventDefault();
    event.stopPropagation();
    setSelectedId(objectId);
    setContextMenu({ objectId, x: event.clientX, y: event.clientY });
  }

  function commitPlacement(commitMaterialTransfer: boolean) {
    if (!selectedId) return;
    setContextMenu(null);
    void execute({ type: "placeInContainer", objectId: selectedId, containerId: "bowl", commitMaterialTransfer });
  }

  function runCommand() {
    const normalized = commandText.trim().toLowerCase();
    if (!normalized) return;
    if (normalized === "branch" || normalized === "分支") {
      void execute({ type: "createBranch", name: "黄油软化版", at: 18 });
      setCommandText("");
      return;
    }
    if ((normalized === "cold" || normalized === "冷区") && selectedId) {
      void execute({ type: "setZone", objectId: selectedId, zone: "cold" });
      setCommandText("");
      return;
    }
    if ((normalized === "hot" || normalized === "热区") && selectedId) {
      void execute({ type: "setZone", objectId: selectedId, zone: "hot" });
      setCommandText("");
      return;
    }
    setMessage("原型命令：branch / 分支 / hot / 热区 / cold / 冷区");
  }

  if (!project) {
    return <main className="loading">{message}</main>;
  }

  const timelineEvents = project.events.filter((event) => {
    if (laneMode === "hot") return event.status !== "measured" || event.kind === "segment";
    return true;
  });

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">LOCALHOST PROTOTYPE</span>
          <h1>{project.title}</h1>
        </div>
        <div className="status-cluster">
          <span className="branch-pill">分支 · {project.branch}</span>
          <span className="local-pill">● {message}</span>
        </div>
      </header>

      <section className="workbench">
        <aside className="note-panel panel">
          <div className="panel-title"><span>Markdown 底稿</span><small>不会自动执行</small></div>
          <textarea
            aria-label="Markdown 底稿"
            value={project.note}
            onChange={(event) => setProject({ ...project, note: event.target.value })}
            onBlur={() => void execute({ type: "updateNote", note: project.note })}
          />
          <div className="bookmark-list">
            <button onClick={() => setMessage("定位到混合区间 · 18 min")}>⌁ 混合区间</button>
            <button onClick={() => setMessage("定位到烘烤观察窗口")}>⌁ 烘烤观察窗口</button>
          </div>
        </aside>

        <section className="canvas-panel panel">
          <div className="canvas-toolbar">
            <div className="zone-tabs">
              <button className={laneMode === "hot" ? "active" : ""} onClick={() => setLaneMode("hot")}>热区</button>
              <button className={laneMode === "cold" ? "active" : ""} onClick={() => setLaneMode("cold")}>冷区</button>
            </div>
            <span>冷热区只影响时间轨线段呈现 · 工作区始终保留全部对象</span>
          </div>
          <div
            className="semantic-canvas"
            ref={canvasRef}
            onDragOver={(event) => event.preventDefault()}
            onDrop={onCanvasDrop}
          >
            <div className="canvas-caption">拖动只更新位置 · 物料关系通过右键 / 工具 / CMD 确认</div>
            {project.objects.map((object) => (
              <button
                key={object.id}
                className={`object-card role-${object.role} ${selectedId === object.id ? "selected" : ""}`}
                style={{ left: object.x, top: object.y, "--accent": object.color } as React.CSSProperties}
                draggable
                onDragStart={(event) => onDragStart(event, object.id)}
                onClick={() => setSelectedId(object.id)}
                onContextMenu={(event) => openContextMenu(event, object.id)}
              >
                <span className="object-role">{roleLabels[object.role]}</span>
                <strong>{object.name}</strong>
                <small>{object.state ?? (object.containerId ? "已建立位置关系" : "身份已声明")}</small>
              </button>
            ))}
          </div>
        </section>

        <aside className="inspector panel">
          <div className="panel-title"><span>对象传记</span><small>派生视图</small></div>
          {selected ? (
            <>
              <div className="inspector-heading" style={{ borderColor: selected.color }}>
                <span>{roleLabels[selected.role]}</span>
                <h2>{selected.name}</h2>
              </div>
              <p>{selected.name} 当前位于{selected.containerId ? "搅拌碗内" : selected.zone === "hot" ? "主动操作集合" : "持续存在集合"}，其身份已声明，过程事实仍可继续补充。</p>
              <dl>
                <dt>稳定 ID</dt><dd>{selected.id}</dd>
                <dt>当前状态</dt><dd>{selected.state ?? "未补充"}</dd>
                <dt>数据版本</dt><dd>revision {project.revision}</dd>
              </dl>
              <button className="secondary" onClick={() => void execute({ type: "setZone", objectId: selected.id, zone: selected.zone === "hot" ? "cold" : "hot" })}>
                {selected.zone === "hot" ? "撤下主动操作" : "带入选中操作"}
              </button>
            </>
          ) : <p className="empty-copy">选择一张便签，查看它目前被系统知道的内容。</p>}
        </aside>
      </section>

      <section className="timeline panel">
        <div className="timeline-header">
          <div><strong>物料＆操作</strong><span>{laneMode === "hot" ? "汇聚与转化的片段" : "这个时段还有什么"}</span></div>
          <span>0—90 min · 无强制当前时刻指针</span>
        </div>
        <div className="ruler">{[0, 15, 30, 45, 60, 75, 90].map((tick) => <span key={tick}>{tick}</span>)}</div>
        <div className="tracks">
          {timelineEvents.map((event) => {
            const width = event.kind === "point" ? 12 : Math.max(8, ((event.end ?? 90) - event.start) / 90 * 100);
            return (
              <button
                key={event.id}
                className={`clip status-${event.status} kind-${event.kind}`}
                style={{ left: `${event.start / 90 * 100}%`, width: event.kind === "point" ? width : `${width}%` }}
                onClick={() => setMessage(`${event.label} · ${event.status}`)}
              >{event.label}</button>
            );
          })}
        </div>
      </section>

      <footer className="command-bar">
        <span>CMD</span>
        <input
          value={commandText}
          onChange={(event) => setCommandText(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && runCommand()}
          placeholder="输入 branch / hot / cold，Enter 执行"
        />
        <button onClick={runCommand}>执行</button>
      </footer>

      {contextMenu && (
        <section className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={(event) => event.stopPropagation()}>
          <header>{project.objects.find(({ id }) => id === contextMenu.objectId)?.name}</header>
          <button onClick={() => commitPlacement(false)}>放入搅拌碗 · 仅空间</button>
          <button onClick={() => commitPlacement(true)}>倒入搅拌碗 · 提交物料</button>
          <button onClick={() => { void execute({ type: "setZone", objectId: contextMenu.objectId, zone: "hot" }); setContextMenu(null); }}>带入选中操作</button>
          <button onClick={() => { void execute({ type: "setZone", objectId: contextMenu.objectId, zone: "cold" }); setContextMenu(null); }}>结束并从热区撤下</button>
        </section>
      )}
    </main>
  );
}
