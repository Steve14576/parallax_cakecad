import type {
  CakeObject,
  ProjectCommand,
  ProjectSnapshot,
  TimelineEvent,
} from "@cakecad/contracts";

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
      case "placeInContainer":
        this.updateObject(command.objectId, (object) => ({ ...object, containerId: command.containerId }));
        this.snapshot.events.push({
          id: crypto.randomUUID(),
          label: command.commitMaterialTransfer ? "确认物料转移" : "仅记录空间放置",
          kind: "point",
          start: 12 + this.snapshot.events.length * 3,
          end: 12 + this.snapshot.events.length * 3,
          objectIds: [command.objectId, command.containerId],
          status: command.commitMaterialTransfer ? "committed" : "sketch",
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

  private updateObject(id: string, update: (object: CakeObject) => CakeObject): void {
    const index = this.snapshot.objects.findIndex((object) => object.id === id);
    if (index < 0) throw new Error(`Object not found: ${id}`);
    this.snapshot.objects[index] = update(this.snapshot.objects[index]!);
  }
}
