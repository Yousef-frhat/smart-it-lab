import api from './api'

// ── Types ────────────────────────────────────────────────────────

export interface TopologyNode {
  id: string;
  type: 'router' | 'switch' | 'pc' | 'server' | 'cloud';
  name: string;
  position: { x: number; y: number };
  ip?: string;
  status: 'active' | 'inactive' | 'error';
  connections: string[];
}

export interface Lab {
  id: string;
  labId: string;
  _id?: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  module: string;          // CCNA module grouping
  order: number;           // display sequence
  estimatedTime: string;
  status: 'not-started' | 'running' | 'stopped' | 'completed';
  progress: number;
  score: number;
  topology: TopologyNode[];
  objectives: string[];
  commands?: string[];
  hints?: string[];
  completedObjectives?: number[];
}

export interface TerminalEntry {
  id: string;
  timestamp: string;
  device: string;
  command: string;
  output: string;
  isError?: boolean;
  prompt?: string;   // the IOS prompt shown before this command (e.g. "R1(config)#")
}

export interface Objective {
  index: number;
  text: string;
  completed: boolean;
}

// ── API Functions ────────────────────────────────────────────────

export async function getLabs(): Promise<Lab[]> {
  const { data } = await api.get('/labs')
  return data.data?.labs ?? data.labs ?? []
}

export async function getLab(id: string): Promise<Lab> {
  const { data } = await api.get(`/labs/${id}`)
  return data.data?.lab ?? data.lab
}

export async function startLab(id: string): Promise<Lab> {
  const { data } = await api.post(`/labs/${id}/start`)
  return data.data?.lab ?? data.lab
}

export async function stopLab(id: string): Promise<Lab> {
  const { data } = await api.post(`/labs/${id}/stop`)
  return data.data?.lab ?? data.lab
}

export async function saveProgress(
  id: string,
  progress: number,
  score?: number,
  completedObjectives?: number[]
): Promise<Lab> {
  const body: Record<string, unknown> = { progress }
  if (score !== undefined) body.score = score
  if (completedObjectives !== undefined) body.completedObjectives = completedObjectives
  const { data } = await api.post(`/labs/${id}/save-progress`, body)
  return data.data?.lab ?? data.lab
}

export interface CommandResult {
  entry: TerminalEntry;
  nextPrompt: string;
  progress: number;
  score: number;
  completedObjectives: number[];
  newlyCompleted: number[];
  labCompleted: boolean;
}

export async function executeCommand(
  labId: string,
  command: string,
  device: string
): Promise<CommandResult> {
  const { data } = await api.post(`/labs/${labId}/terminal`, { command, device })
  const d = data.data ?? data
  const entry = d.entry
  return {
    entry: {
      id: entry.entryId ?? entry.id ?? `cmd-${Date.now()}`,
      timestamp: entry.timestamp ?? new Date().toISOString(),
      device: entry.device ?? device,
      command: entry.command ?? command,
      output: entry.output ?? '',
      isError: entry.isError ?? false,
      prompt: entry.prompt ?? `${device}>`,
    },
    nextPrompt: d.prompt ?? `${device}>`,
    progress: d.progress ?? 0,
    score: d.score ?? 0,
    completedObjectives: d.completedObjectives ?? [],
    newlyCompleted: d.newlyCompleted ?? [],
    labCompleted: d.labCompleted ?? false,
  }
}

export async function getObjectives(id: string): Promise<{ objectives: Objective[]; progress: number }> {
  const { data } = await api.get(`/labs/${id}/objectives`)
  return {
    objectives: data.data?.objectives ?? [],
    progress: data.data?.progress ?? 0,
  }
}
