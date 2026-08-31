import { useEffect, useMemo, useRef, useState } from "react";
import type { CakeObject, ProjectCommand, ProjectSnapshot, TimelineEvent } from "@cakecad/contracts";
import { loadProject, sendCommand } from "./api";

const MAX_TIME = 90;
const SNAP_THRESHOLD = 0.9;

type Verb = "pour" | "place";

type PickState = { verb: Verb; subjectId: string | null } | null;
type PendingCommit = { verb: Verb; subjectId: string; targetId: string } | null;
type ClipDrag = { id: string; start: number; end: number | null } | null;
type ContextMenu = { objectId: string; x: number; y: number } | null;
type CmdEntry = { input: string; output: string; ok: boolean };

const roleLabels: Record<CakeObject["role"], string> = {
  material: "物料",
  container: "容器",
  tool: "工具",
  device: "设备",
  intermediate: "中间体",
};

const verbLabels: Record<Verb, string> = { pour: "倒入", place: "放入" };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function formatTimecode(minutes: number): string {
  const totalSeconds = Math.floor(minutes * 60);
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  return `00:${mm}:${ss}`;
}

const TOOLBAR: { id: string; glyph: string; label: string; verb?: Verb; action?: "branch"; todo?: boolean }[] = [
  { id: "new", glyph: "＋", label: "新建", todo: true },
  { id: "select", glyph: "➤", label: "选择", todo: true },
  { id: "move", glyph: "✥", label: "移动", todo: true },
  { id: "pour", glyph: "⤓", label: "倒入", verb: "pour" },
  { id: "place", glyph: "⊞", label: "放入", verb: "place" },
  { id: "split", glyph: "⋔", label: "分件", todo: true },
  { id: "measure", glyph: "◎", label: "测量", todo: true },
  { id: "name", glyph: "✎", label: "命名", todo: true },
  { id: "branch", glyph: "⑂", label: "分支", action: "branch" },
  { id: "mark", glyph: "⌖", label: "书签", todo: true },
];

export function App() {
  const [project, setProject] = useState<ProjectSnapshot | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [laneMode, setLaneMode] = useState<"hot" | "cold">("hot");
  const [mainTrack, setMainTrack] = useState<"process" | "space">("process");
  const [playhead, setPlayhead] = useState(27);
  const [playing, setPlaying] = useState(false);
  const [picking, setPicking] = useState<PickState>(null);
  const [pendingCommit, setPendingCommit] = useState<PendingCommit>(null);
  const [clipDrag, setClipDrag] = useState<ClipDrag>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu>(null);
  const [commandText, setCommandText] = useState("");
  const [cmdHistory, setCmdHistory] = useState<CmdEntry[]>([]);
  const [message, setMessage] = useState("CONNECTING…");
  const [clock, setClock] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);
  const tracksRef = useRef<HTMLDivElement>(null);
  const cmdHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProject()
      .then((snapshot) => {
        setProject(snapshot);
        setMessage("STATUS: READY");
      })
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "连接失败"));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date().toTimeString().slice(0, 8)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setPlayhead((current) => (current >= MAX_TIME ? 0 : current + 0.5)), 250);
    return () => clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  useEffect(() => {
    cmdHistoryRef.current?.scrollTo(0, cmdHistoryRef.current.scrollHeight);
  }, [cmdHistory]);

  const selected = useMemo(
    () => project?.objects.find(({ id }) => id === selectedId) ?? null,
    [project, selectedId],
  );

  const objectName = (id: string) => project?.objects.find(({ id: candidate }) => candidate === id)?.name ?? id;

  async function execute(command: ProjectCommand) {
    try {
      setProject(await sendCommand(command));
      setMessage(`COMMITTED · ${command.type}`);
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "命令失败");
      return false;
    }
  }

  function cancelCommand() {
    setPicking(null);
    setPendingCommit(null);
    setMessage("STATUS: READY");
  }

  function arm(verb: Verb, subjectId: string | null) {
    setContextMenu(null);
    setPendingCommit(null);
    setPicking({ verb, subjectId });
  }

  function pickObject(object: CakeObject) {
    if (!picking) {
      setSelectedId(object.id);
      return;
    }
    if (picking.subjectId === null) {
      if (picking.verb === "pour" && object.role !== "material") {
        setMessage(`倒入的宾语必须是物料，“${object.name}”是${roleLabels[object.role]}`);
        return;
      }
      setPicking({ ...picking, subjectId: object.id });
      return;
    }
    if (object.role !== "container") {
      setMessage(`目标必须是容器，“${object.name}”是${roleLabels[object.role]}`);
      return;
    }
    setPendingCommit({ verb: picking.verb, subjectId: picking.subjectId, targetId: object.id });
  }

  function commitPending() {
    if (!pendingCommit) return;
    const { verb, subjectId, targetId } = pendingCommit;
    const command: ProjectCommand = verb === "pour"
      ? { type: "pourInto", materialId: subjectId, containerId: targetId, at: playhead }
      : { type: "placeInto", objectId: subjectId, targetId, at: playhead };
    setPicking(null);
    setPendingCommit(null);
    void execute(command);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea")) return;
      if (event.key === "Escape") cancelCommand();
      if (event.key === "Enter" && pendingCommit) commitPending();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  /* ── 工作区便签拖拽（只更新位置） ── */

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

  /* ── playhead ── */

  const snapToEdges = (time: number, events: TimelineEvent[]) => {
    for (const event of events) {
      for (const edge of [event.start, event.end]) {
        if (edge !== null && Math.abs(time - edge) < SNAP_THRESHOLD) return edge;
      }
    }
    return time;
  };

  function movePlayhead(clientX: number) {
    const tracks = tracksRef.current;
    if (!tracks || !project) return;
    const rect = tracks.getBoundingClientRect();
    const raw = clamp((clientX - rect.left) / rect.width, 0, 1) * MAX_TIME;
    setPlayhead(clamp(snapToEdges(raw, project.events), 0, MAX_TIME));
  }

  function beginPlayheadDrag(event: React.PointerEvent) {
    event.preventDefault();
    event.stopPropagation();
    movePlayhead(event.clientX);
    const onMove = (move: PointerEvent) => movePlayhead(move.clientX);
    const onUp = () => window.removeEventListener("pointermove", onMove);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
  }

  /* ── clip 拖动与首尾拉伸 ── */

  function beginClipDrag(event: React.PointerEvent, clip: TimelineEvent, mode: "move" | "start" | "end") {
    event.preventDefault();
    event.stopPropagation();
    const tracks = tracksRef.current;
    if (!tracks || clip.kind === "point") return;
    const rect = tracks.getBoundingClientRect();
    const startX = event.clientX;
    const origin = { start: clip.start, end: clip.end };
    let latest: ClipDrag = { id: clip.id, start: clip.start, end: clip.end };

    const onMove = (move: PointerEvent) => {
      const dt = ((move.clientX - startX) / rect.width) * MAX_TIME;
      if (mode === "move") {
        const duration = (origin.end ?? MAX_TIME) - origin.start;
        const start = clamp(origin.start + dt, 0, MAX_TIME - duration);
        latest = { id: clip.id, start, end: origin.end === null ? null : start + duration };
      } else if (mode === "start") {
        const end = origin.end ?? MAX_TIME;
        latest = { id: clip.id, start: clamp(origin.start + dt, 0, end - 0.5), end: origin.end };
      } else {
        latest = { id: clip.id, start: origin.start, end: clamp((origin.end ?? MAX_TIME) + dt, origin.start + 0.5, MAX_TIME) };
      }
      setClipDrag(latest);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      setClipDrag(null);
      if (latest && (latest.start !== origin.start || latest.end !== origin.end)) {
        void execute({ type: "updateEventTime", eventId: clip.id, start: latest.start, end: latest.end });
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
  }

  /* ── CMD ── */

  function pushHistory(input: string, output: string, ok: boolean) {
    setCmdHistory((history) => [...history, { input, output, ok }]);
  }

  function runCommand() {
    const input = commandText.trim().toLowerCase();
    if (!input) return;
    let output = "OK";
    let ok = true;
    if (input === "倒入" || input === "pour") {
      arm("pour", selected?.role === "material" ? selected.id : null);
      output = selected?.role === "material" ? `ARM pour → ${selected.name} → ?` : "ARM pour · 点选物料";
    } else if (input === "放入" || input === "place") {
      arm("place", selected?.id ?? null);
      output = selected ? `ARM place → ${selected.name} → ?` : "ARM place · 点选对象";
    } else if (input === "分支" || input === "branch") {
      void execute({ type: "createBranch", name: "黄油软化版", at: playhead });
      output = `BRANCH 黄油软化版 @ ${formatTimecode(playhead)}`;
    } else if ((input === "热区" || input === "hot") && selectedId) {
      void execute({ type: "setZone", objectId: selectedId, zone: "hot" });
    } else if ((input === "冷区" || input === "cold") && selectedId) {
      void execute({ type: "setZone", objectId: selectedId, zone: "cold" });
    } else if (input === "help") {
      output = "谓语：倒入 pour / 放入 place / 分支 branch / 热区 hot / 冷区 cold";
    } else {
      output = "未知谓语 · help 查看";
      ok = false;
    }
    pushHistory(input, output, ok);
    setCommandText("");
  }

  function runTool(tool: (typeof TOOLBAR)[number]) {
    if (tool.verb) {
      arm(tool.verb, tool.verb === "pour" ? (selected?.role === "material" ? selected.id : null) : (selected?.id ?? null));
    } else if (tool.action === "branch") {
      void execute({ type: "createBranch", name: "黄油软化版", at: playhead });
    } else {
      setMessage(`${tool.label} · 未实装（M2）`);
    }
  }

  if (!project) {
    return <main className="loading">{message}</main>;
  }

  const timelineEvents = project.events.filter((event) => {
    if (laneMode === "hot") return event.status !== "measured" || event.kind === "segment";
    return true;
  });

  const commandStatus = pendingCommit
    ? `${verbLabels[pendingCommit.verb]}：${objectName(pendingCommit.subjectId)} → ${objectName(pendingCommit.targetId)} · Enter 提交 · Esc 取消`
    : picking?.subjectId
      ? `${verbLabels[picking.verb]}：${objectName(picking.subjectId)} → ？ · 点选目标容器`
      : picking
        ? `${verbLabels[picking.verb]} · 点选${picking.verb === "pour" ? "物料" : "对象"}`
        : null;

  return (
    <main className={`app-shell ${picking ? "picking" : ""}`}>
      {/* ── 顶栏 ── */}
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">◈</span>
          <div>
            <strong>CakeCAD</strong>
            <small>TIME IS THE COORDINATE · v0.1.0 LOCAL</small>
          </div>
        </div>
        <div className="project-meta">
          <span>PROJECT <b>{project.title}</b></span>
          <span>BRANCH <b>{project.branch}</b></span>
        </div>
        <nav className="main-tabs">
          <button className={mainTrack === "process" ? "active" : ""} onClick={() => setMainTrack("process")}>物料＆操作</button>
          <button className={mainTrack === "space" ? "active" : ""} onClick={() => setMainTrack("space")}>物料＆位置</button>
        </nav>
        <div className="status-cluster">
          <span className="local-pill"><i />LOCAL · OFFLINE</span>
          <span className="clock">{clock}</span>
          <span className="sys">SYS: NOMINAL</span>
        </div>
      </header>

      {/* ── 视口条 ── */}
      <div className="viewport-bar">
        <span>GRID: ON · OBJECTS: {String(project.objects.length).padStart(2, "0")} · REV: {project.revision}</span>
        <span>{commandStatus ?? (selected ? `SELECTED: ${selected.name}` : "SELECTED: —")}</span>
        <span>VIEW: TABLETOP · Z: 2D PROXY</span>
      </div>

      {/* ── 主舞台 ── */}
      <section className="stage">
        <nav className="tool-rail">
          {TOOLBAR.map((tool) => (
            <button
              key={tool.id}
              title={tool.todo ? `${tool.label} · 未实装（M2）` : tool.label}
              onClick={() => runTool(tool)}
            >
              <span className="tool-glyph">{tool.glyph}</span>
              <span className="tool-label">{tool.label}</span>
            </button>
          ))}
        </nav>

        <section className="canvas-panel">
          <div
            className="semantic-canvas"
            ref={canvasRef}
            onDragOver={(event) => event.preventDefault()}
            onDrop={onCanvasDrop}
          >
            {project.objects.map((object) => (
              <button
                key={object.id}
                className={`object-card role-${object.role} ${selectedId === object.id ? "selected" : ""} ${picking && object.role === "container" && picking.subjectId !== object.id ? "pickable" : ""}`}
                style={{ left: object.x, top: object.y, "--accent": object.color } as React.CSSProperties}
                draggable
                onDragStart={(event) => onDragStart(event, object.id)}
                onClick={() => pickObject(object)}
                onContextMenu={(event) => openContextMenu(event, object.id)}
              >
                <span className="object-role">{roleLabels[object.role]}</span>
                <strong>{object.name}</strong>
                <small>{object.state ?? (object.containerId ? `在${objectName(object.containerId)}内` : "身份已声明")}</small>
              </button>
            ))}
            <div className="canvas-caption">拖动只更新位置 · 物料关系通过右键 / 工具 / CMD 确认</div>
          </div>
        </section>

        <aside className="right-column">
          <section className="md-panel panel">
            <div className="panel-title"><span>CAKE MARKDOWN</span><small>不会自动执行</small></div>
            <div className="md-toolbar"><span>B</span><span>I</span><span>H</span><span>&lt;/&gt;</span><span>“</span><span>≡</span></div>
            <textarea
              aria-label="Markdown 底稿"
              value={project.note}
              onChange={(event) => setProject({ ...project, note: event.target.value })}
              onBlur={() => void execute({ type: "updateNote", note: project.note })}
            />
          </section>

          <section className="inspector panel">
            <div className="panel-title"><span>OBJECT DOSSIER</span><small>派生视图</small></div>
            {selected ? (
              <div className="dossier">
                <div className="inspector-heading" style={{ borderColor: selected.color }}>
                  <span>{roleLabels[selected.role]}</span>
                  <h2>{selected.name}</h2>
                </div>
                <p>{selected.name} 当前位于{selected.containerId ? `${objectName(selected.containerId)}内` : selected.zone === "hot" ? "主动操作集合" : "持续存在集合"}，其身份已声明，过程事实仍可继续补充。</p>
                <dl>
                  <dt>稳定 ID</dt><dd>{selected.id}</dd>
                  <dt>角色</dt><dd>{roleLabels[selected.role]}</dd>
                  <dt>当前状态</dt><dd>{selected.state ?? "未补充"}</dd>
                  <dt>数据版本</dt><dd>revision {project.revision}</dd>
                </dl>
                <button className="secondary" onClick={() => void execute({ type: "setZone", objectId: selected.id, zone: selected.zone === "hot" ? "cold" : "hot" })}>
                  {selected.zone === "hot" ? "撤下主动操作" : "带入选中操作"}
                </button>
              </div>
            ) : <p className="empty-copy">选择一张便签，查看它目前被系统知道的内容。</p>}
          </section>

          <section className="cmd-panel panel">
            <div className="panel-title"><span>CAKE CMD</span><small>help 查看谓语</small></div>
            <div className="cmd-history" ref={cmdHistoryRef}>
              <div className="cmd-line sys">CakeCAD Command Line Interface</div>
              <div className="cmd-line sys">Type &apos;help&apos; for available verbs.</div>
              {cmdHistory.map((entry, index) => (
                <div key={index}>
                  <div className="cmd-line in">CakeCAD&gt; {entry.input}</div>
                  <div className={`cmd-line ${entry.ok ? "ok" : "err"}`}>{entry.output}</div>
                </div>
              ))}
            </div>
            <div className="cmd-input-row">
              <span>CakeCAD&gt;</span>
              <input
                value={commandText}
                onChange={(event) => setCommandText(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && runCommand()}
                placeholder="倒入 / 放入 / 分支 …"
              />
              <span className="cursor-block">▊</span>
            </div>
          </section>
        </aside>
      </section>

      {/* ── CAKE DAW ── */}
      <section className="daw">
        <div className="daw-header">
          <div className="daw-title"><span>CAKE DAW</span><small>{mainTrack === "process" ? "物料＆操作" : "物料＆位置"}</small></div>
          <div className="transport">
            <button onClick={() => setPlayhead(0)}>⏮</button>
            <button className={playing ? "active" : ""} onClick={() => setPlaying(!playing)}>{playing ? "⏸" : "▶"}</button>
            <button onClick={() => setPlayhead(MAX_TIME)}>⏭</button>
          </div>
          <span className="timecode">{formatTimecode(playhead)}</span>
          <div className="zone-tabs">
            <button className={laneMode === "hot" ? "active" : ""} onClick={() => setLaneMode("hot")}>热区</button>
            <button className={laneMode === "cold" ? "active" : ""} onClick={() => setLaneMode("cold")}>冷区</button>
          </div>
        </div>
        <div className="daw-body">
          <div className="track-heads">
            {timelineEvents.map((event) => (
              <div key={event.id} className="track-head">
                <span className={`track-dot status-${event.status}`} />
                <span className="track-name">{event.label}</span>
              </div>
            ))}
          </div>
          <div className="lanes" ref={tracksRef}>
            <div className="ruler" onPointerDown={beginPlayheadDrag}>
              {[0, 15, 30, 45, 60, 75, 90].map((tick) => <span key={tick}>{formatTimecode(tick)}</span>)}
            </div>
            <div className="lane-rows">
              <div className="playhead" style={{ left: `${(playhead / MAX_TIME) * 100}%` }} onPointerDown={beginPlayheadDrag} />
              {timelineEvents.map((event) => {
                const dragged = clipDrag?.id === event.id ? clipDrag : null;
                const start = dragged?.start ?? event.start;
                const end = dragged?.end ?? event.end;
                return (
                  <div key={event.id} className={`lane-row ${laneMode === "cold" ? "thin" : ""}`}>
                    {event.kind === "point" ? (
                      <span className="keyframe" style={{ left: `${(start / MAX_TIME) * 100}%` }} title={event.label} />
                    ) : (
                      <div
                        className={`clip status-${event.status}`}
                        style={{
                          left: `${(start / MAX_TIME) * 100}%`,
                          width: `${Math.max(0.6, (((end ?? MAX_TIME) - start) / MAX_TIME) * 100)}%`,
                        }}
                        onPointerDown={(pointer) => beginClipDrag(pointer, event, "move")}
                      >
                        <span className="clip-edge left" onPointerDown={(pointer) => beginClipDrag(pointer, event, "start")} />
                        <span className="clip-label">{event.label}</span>
                        <span className="clip-edge right" onPointerDown={(pointer) => beginClipDrag(pointer, event, "end")} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── 状态栏 ── */}
      <footer className="status-bar">
        <span className={message.startsWith("STATUS") ? "" : "busy"}>{commandStatus ?? message}</span>
        <span>UNITS: MIN · SNAP: ON</span>
        <span>CAKECAD</span>
      </footer>

      {contextMenu && (
        <section className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={(event) => event.stopPropagation()}>
          <header>{objectName(contextMenu.objectId)}</header>
          {project.objects.find(({ id }) => id === contextMenu.objectId)?.role === "material" && (
            <button onClick={() => arm("pour", contextMenu.objectId)}>倒入…</button>
          )}
          <button onClick={() => arm("place", contextMenu.objectId)}>放入…</button>
          <button onClick={() => { void execute({ type: "createBranch", name: "黄油软化版", at: playhead }); setContextMenu(null); }}>创建分支</button>
          <button onClick={() => { const target = project.objects.find(({ id }) => id === contextMenu.objectId); if (target) void execute({ type: "setZone", objectId: target.id, zone: target.zone === "hot" ? "cold" : "hot" }); setContextMenu(null); }}>
            {project.objects.find(({ id }) => id === contextMenu.objectId)?.zone === "hot" ? "结束并从热区撤下" : "带入选中操作"}
          </button>
        </section>
      )}
    </main>
  );
}
