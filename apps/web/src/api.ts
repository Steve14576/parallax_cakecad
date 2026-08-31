import type { ProjectCommand, ProjectSnapshot } from "@cakecad/contracts";

export async function loadProject(): Promise<ProjectSnapshot> {
  const response = await fetch("/api/project");
  if (!response.ok) throw new Error("无法读取本地项目");
  return response.json() as Promise<ProjectSnapshot>;
}

export async function sendCommand(command: ProjectCommand): Promise<ProjectSnapshot> {
  const response = await fetch("/api/commands", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(command),
  });
  if (!response.ok) throw new Error("本地命令执行失败");
  return response.json() as Promise<ProjectSnapshot>;
}
