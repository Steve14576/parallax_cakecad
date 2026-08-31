import Fastify from "fastify";
import { projectCommandSchema } from "@cakecad/contracts";
import { ProjectStore } from "@cakecad/core";

const host = "127.0.0.1";
const port = Number(process.env.CAKECAD_PORT ?? 4317);
const app = Fastify({ logger: true });
const store = new ProjectStore();

app.get("/api/health", async () => ({ ok: true, service: "cakecad-local" }));
app.get("/api/project", async () => store.read());

app.post("/api/commands", async (request, reply) => {
  const parsed = projectCommandSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: "invalid_command", details: parsed.error.issues });
  }

  try {
    return store.execute(parsed.data);
  } catch (error) {
    return reply.status(404).send({
      error: "command_failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

await app.listen({ host, port });
