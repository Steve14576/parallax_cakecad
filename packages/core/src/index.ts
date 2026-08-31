import type {
  CakeObject,
  ProjectCommand,
  ProjectSnapshot,
  TimelineEvent,
} from "@cakecad/contracts";

export const MAX_TIME = 90;
export const DEFAULT_CLIP_DURATION = 3;
const MIN_CLIP_DURATION = 0.5;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const initialObjects: CakeObject[] = [
  { id: "flour", name: "面粉", role: "material", x: 58, y: 62, zone: "hot", containerId: null, color: "#f0c96d" },
  { id: "sugar", name: "糖", role: "material", x: 190, y: 72, zone: "hot", containerId: null, color: "#f6d98c" },
  { id: "butter", name: "黄油", role: "material", x: 322, y: 58, zone: "hot", containerId: null, color: "#edb74d", state: "未软化" },
  { id: "egg", name: "蛋", role: "material", x: 445, y: 70, zone: "hot", containerId: null, color: "#ef9c55" },
  { id: "chips", name: "巧克力豆", role: "material", x: 565, y: 60, zone: "cold", containerId: null, color: "#8c5b48" },
  { id: "bowl", name: "搅拌碗", role: "container", x: 255, y: 240, zone: "hot", containerId: null, color: "#6aa6b8" },
  { id: "mixer", name: "厨师机", role: "device", x: 520, y: 230, zone: "cold", containerId: null, color: "#688ca5" },
  { id: "tray", name: "烤盘", role: "container", x: 70, y: 375, zone: "cold", containerId: null, color: "#70899b" },
  { id: "oven", name: "烤箱", role: "device", x: 500, y: 370, zone: "cold", containerId: null, color: "#657886" },
];

const initialEvents: TimelineEvent[] = [
  { id: "presence", label: "原料与设备存在", kind: "segment", start: 0, end: 90, objectIds: initialObjects.map(({ id }) => id), status: "declared" },
  { id: "mix", label: "混合（结束待定）", kind: "segment", start: 18, end: null, objectIds: ["bowl", "mixer"], status: "sketch" },
  { id: "add-butter", label: "中途加入黄油", kind: "point", start: 32, end: 32, objectIds: ["butter", "bowl"], status: "declared" },
];

export class ProjectStore {
  private snapshot: ProjectSnapshot = {
    title: "曲奇纵切体验",
    note: "# 曲奇试作\n\n黄油可能要先软化。\n\n烤到边缘上色、中心偏软。\n\n> 这里可以随便写，不会自动变成流程。",
    branch: "main",
    objects: structuredClone(initialObjects),
    events: structuredClone(initialEvents),
    revision: 0,
  };

  read(): ProjectSnapshot {
    return structuredClone(this.snapshot);
  }

  execute(command: ProjectCommand): ProjectSnapshot {
    switch (command.type) {
      case "moveObject":
        this.updateObject(command.objectId, (object) => ({ ...object, x: command.x, y: command.y }));
        break;

      case "setZone":
        this.updateObject(command.objectId, (object) => ({ ...object, zone: command.zone }));
        break;

      case "placeInto": {
        const object = this.getObject(command.objectId);
        const target = this.getObject(command.targetId);
        if (target.role === "container") {
          this.updateObject(object.id, (current) => ({ ...current, containerId: target.id }));
        }
        this.pushClip(`放入：${object.name} → ${target.name}`, command.at, "declared", [object.id, target.id]);
        break;
      }

      case "pourInto": {
        const material = this.getObject(command.materialId);
        const container = this.getObject(command.containerId);
        if (material.role !== "material") throw new Error(`“${material.name}”不是物料，不能倒入`);
        if (container.role !== "container") throw new Error(`“${container.name}”不是容器，不能作为倒入目标`);
        this.updateObject(material.id, (current) => ({ ...current, containerId: container.id }));
        this.pushClip(`倒入：${material.name} → ${container.name}`, command.at, "committed", [material.id, container.id]);
        break;
      }

      case "updateEventTime":
        this.updateEvent(command.eventId, (event) => {
          const start = clamp(command.start, 0, MAX_TIME);
          const end = command.end === null
            ? null
            : clamp(command.end, start + MIN_CLIP_DURATION, MAX_TIME);
          return { ...event, start, end };
        });
        break;

      case "updateNote":
        this.snapshot.note = command.note;
        break;

      case "createBranch":
        this.snapshot.branch = command.name;
        this.snapshot.events.push({
          id: crypto.randomUUID(),
          label: `创建分支：${command.name}`,
          kind: "point",
          start: command.at,
          end: command.at,
          objectIds: [],
          status: "committed",
        });
        break;
    }

    this.snapshot.revision += 1;
    return this.read();
  }

  private pushClip(label: string, at: number, status: TimelineEvent["status"], objectIds: string[]): void {
    this.snapshot.events.push({
      id: crypto.randomUUID(),
      label,
      kind: "segment",
      start: clamp(at, 0, MAX_TIME - DEFAULT_CLIP_DURATION),
      end: clamp(at + DEFAULT_CLIP_DURATION, MIN_CLIP_DURATION, MAX_TIME),
      objectIds,
      status,
    });
  }

  private getObject(id: string): CakeObject {
    const object = this.snapshot.objects.find((candidate) => candidate.id === id);
    if (!object) throw new Error(`Object not found: ${id}`);
    return object;
  }

  private updateObject(id: string, update: (object: CakeObject) => CakeObject): void {
    const index = this.snapshot.objects.findIndex((object) => object.id === id);
    if (index < 0) throw new Error(`Object not found: ${id}`);
    this.snapshot.objects[index] = update(this.snapshot.objects[index]!);
  }

  private updateEvent(id: string, update: (event: TimelineEvent) => TimelineEvent): void {
    const index = this.snapshot.events.findIndex((event) => event.id === id);
    if (index < 0) throw new Error(`Event not found: ${id}`);
    this.snapshot.events[index] = update(this.snapshot.events[index]!);
  }
}
