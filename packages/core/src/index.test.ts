import { describe, expect, it } from "vitest";
import { ProjectStore } from "./index";

describe("ProjectStore", () => {
  it("keeps spatial placement distinct from material commitment", () => {
    const store = new ProjectStore();
    const snapshot = store.execute({
      type: "placeInContainer",
      objectId: "flour",
      containerId: "bowl",
      commitMaterialTransfer: false,
    });

    expect(snapshot.objects.find(({ id }) => id === "flour")?.containerId).toBe("bowl");
    expect(snapshot.events.at(-1)?.status).toBe("sketch");
  });

  it("records an explicit material transfer as committed", () => {
    const store = new ProjectStore();
    const snapshot = store.execute({
      type: "placeInContainer",
      objectId: "sugar",
      containerId: "bowl",
      commitMaterialTransfer: true,
    });

    expect(snapshot.events.at(-1)?.status).toBe("committed");
  });
});
