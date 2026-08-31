import { describe, expect, it } from "vitest";
import { DEFAULT_CLIP_DURATION, MAX_TIME, ProjectStore } from "./index";

describe("ProjectStore", () => {
  it("倒入生成落在指定时刻的有长度 committed 片段，并建立容器关系", () => {
    const store = new ProjectStore();
    const snapshot = store.execute({ type: "pourInto", materialId: "flour", containerId: "bowl", at: 10 });

    expect(snapshot.objects.find(({ id }) => id === "flour")?.containerId).toBe("bowl");
    const clip = snapshot.events.at(-1)!;
    expect(clip.status).toBe("committed");
    expect(clip.kind).toBe("segment");
    expect(clip.start).toBe(10);
    expect(clip.end).toBe(10 + DEFAULT_CLIP_DURATION);
  });

  it("放入是 declared 片段，与物料倒入区分", () => {
    const store = new ProjectStore();
    const snapshot = store.execute({ type: "placeInto", objectId: "sugar", targetId: "bowl", at: 20 });

    expect(snapshot.events.at(-1)?.status).toBe("declared");
  });

  it("倒入拒绝非容器目标", () => {
    const store = new ProjectStore();
    expect(() => store.execute({ type: "pourInto", materialId: "flour", containerId: "sugar", at: 5 })).toThrow(/不是容器/);
  });

  it("clip 首尾可调整，且被夹在时间域内", () => {
    const store = new ProjectStore();
    store.execute({ type: "updateEventTime", eventId: "mix", start: 12, end: 40 });
    let snapshot = store.read();
    expect(snapshot.events.find(({ id }) => id === "mix")).toMatchObject({ start: 12, end: 40 });

    snapshot = store.execute({ type: "updateEventTime", eventId: "mix", start: -5, end: 200 });
    const mix = snapshot.events.find(({ id }) => id === "mix")!;
    expect(mix.start).toBe(0);
    expect(mix.end).toBe(MAX_TIME);

    snapshot = store.execute({ type: "updateEventTime", eventId: "mix", start: 30, end: null });
    expect(snapshot.events.find(({ id }) => id === "mix")?.end).toBeNull();
  });
});
