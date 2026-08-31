import { z } from "zod";

export const objectRoleSchema = z.enum([
  "material",
  "container",
  "tool",
  "device",
  "intermediate",
]);

export const cakeObjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  role: objectRoleSchema,
  x: z.number(),
  y: z.number(),
  zone: z.enum(["hot", "cold"]),
  containerId: z.string().nullable(),
  color: z.string(),
  state: z.string().optional(),
});

export const timelineEventSchema = z.object({
  id: z.string(),
  label: z.string(),
  kind: z.enum(["point", "segment"]),
  start: z.number().nonnegative(),
  end: z.number().nullable(),
  objectIds: z.array(z.string()),
  status: z.enum(["sketch", "declared", "committed", "measured"]),
});

export const projectSnapshotSchema = z.object({
  title: z.string(),
  note: z.string(),
  branch: z.string(),
  objects: z.array(cakeObjectSchema),
  events: z.array(timelineEventSchema),
  revision: z.number().int().nonnegative(),
});

export const projectCommandSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("moveObject"),
    objectId: z.string(),
    x: z.number(),
    y: z.number(),
  }),
  z.object({
    type: z.literal("setZone"),
    objectId: z.string(),
    zone: z.enum(["hot", "cold"]),
  }),
  z.object({
    type: z.literal("placeInto"),
    objectId: z.string(),
    targetId: z.string(),
    at: z.number().nonnegative(),
  }),
  z.object({
    type: z.literal("pourInto"),
    materialId: z.string(),
    containerId: z.string(),
    at: z.number().nonnegative(),
  }),
  z.object({
    type: z.literal("updateEventTime"),
    eventId: z.string(),
    start: z.number().nonnegative(),
    end: z.number().nullable(),
  }),
  z.object({
    type: z.literal("updateNote"),
    note: z.string(),
  }),
  z.object({
    type: z.literal("createBranch"),
    name: z.string().min(1),
    at: z.number().nonnegative(),
  }),
]);

export type CakeObject = z.infer<typeof cakeObjectSchema>;
export type TimelineEvent = z.infer<typeof timelineEventSchema>;
export type ProjectSnapshot = z.infer<typeof projectSnapshotSchema>;
export type ProjectCommand = z.infer<typeof projectCommandSchema>;
