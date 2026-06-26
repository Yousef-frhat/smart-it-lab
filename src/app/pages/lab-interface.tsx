import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useLanguage } from "@/app/contexts/language-context";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Network, CheckCircle2, Terminal, ArrowLeft,
  Loader2, PlayCircle, Server, Laptop, Cloud,
  Square, StopCircle, XCircle, Send, ZoomIn, ZoomOut, RotateCcw
} from "lucide-react";
import {
  getLab as fetchLab,
  startLab as apiStartLab,
  stopLab as apiStopLab,
  executeCommand as apiExecuteCommand,
  saveProgress as apiSaveProgress,
  getObjectives as apiGetObjectives,
  Lab,
  TerminalEntry,
  CommandResult,
} from "@/app/services/lab-api";
import { useLabEvents } from "@/app/hooks/useLabEvents";
import { getErrorMessage } from "@/app/utils/get-error-message";
import { toast } from "sonner";

export default function LabInterface() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [lab, setLab] = useState<Lab | null>(null);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<TerminalEntry[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completedObjectiveIndices, setCompletedObjectiveIndices] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [submittedScore, setSubmittedScore] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [topoZoom, setTopoZoom] = useState(1);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const isExecuting = useRef(false);
  // Dedupe toasts across the HTTP response and SSE so they never double-fire
  const toastedObjRef = useRef<Set<number>>(new Set());
  const toastedCompleteRef = useRef(false);

  // Apply the authoritative result returned by the terminal command HTTP call.
  // This is the reliable path (works in production even without SSE).
  const applyCommandResult = (res: CommandResult) => {
    setCompletedObjectiveIndices(res.completedObjectives ?? []);
    if (!isSubmitted) {
      setLab((prev) =>
        prev ? { ...prev, progress: res.progress ?? prev.progress, score: res.score ?? prev.score } : prev
      );
    }
    for (const idx of res.newlyCompleted ?? []) {
      if (toastedObjRef.current.has(idx)) continue;
      toastedObjRef.current.add(idx);
      const name = lab?.objectives[idx] ?? `Objective ${idx + 1}`;
      toast.success(`✅ Objective complete: ${name}`);
    }
    if (res.labCompleted && !toastedCompleteRef.current && !isSubmitted) {
      toastedCompleteRef.current = true;
      toast.success(`🎉 Lab complete! Score: ${res.score}%`, { duration: 5000 });
    }
  };

  // SSE real-time events
  const { lastEvent } = useLabEvents(lab?.status === 'running' ? (id ?? null) : null);

  // ── Load lab on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    fetchLab(id)
      .then((loadedLab) => {
        setLab(loadedLab);
        if (loadedLab.topology.length > 0) {
          setSelectedDevice(loadedLab.topology[0].id);
        }
        setCompletedObjectiveIndices(loadedLab.completedObjectives ?? []);
      })
      .catch(() => {
        toast.error("Lab not found");
        navigate("/dashboard");
      });
  }, [id, navigate]);

  // ── Load objectives ────────────────────────────────────────────
  useEffect(() => {
    if (!id || !lab) return;
    apiGetObjectives(id)
      .then((data) => {
        const completed = data.objectives
          .filter((o) => o.completed)
          .map((o) => o.index);
        setCompletedObjectiveIndices(completed);
      })
      .catch((err) => {
        console.warn("Failed to load objectives:", err);
      });
  }, [id, lab?.status]);

  // Timer
  useEffect(() => {
    if (!lab || lab.status !== 'running') return;

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [lab]);

  // Auto-scroll terminal with requestAnimationFrame for smooth rendering
  useEffect(() => {
    requestAnimationFrame(() => {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [terminalHistory]);

  // Reset the live prompt to user-EXEC when the selected device changes.
  // (The backend keeps each device's real CLI state; this just resets the
  // on-screen prompt so it starts at "<device>>" for the newly selected node.)
  useEffect(() => {
    const name = lab?.topology.find((n) => n.id === selectedDevice)?.name;
    if (name) setCurrentPrompt(`${name}>`);
  }, [selectedDevice]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handle SSE events ──────────────────────────────────────────
  useEffect(() => {
    if (!lastEvent || !lab) return;

    if (lastEvent.type === 'objective_complete') {
      const { objectiveId, name } = lastEvent.data;
      const idx = typeof objectiveId === 'number' ? objectiveId : parseInt(String(objectiveId), 10);
      if (!Number.isNaN(idx) && !toastedObjRef.current.has(idx)) {
        toastedObjRef.current.add(idx);
        toast.success(`✅ Objective complete: ${String(name || objectiveId)}`);
      }
      setCompletedObjectiveIndices((prev) => {
        return prev.includes(idx) ? prev : [...prev, idx];
      });
    }

    if (lastEvent.type === 'lab_complete') {
      const { score, completedObjectives: completedArr } = lastEvent.data as {
        score: number;
        completedObjectives?: number[];
        unlockedAchievements?: string[];
      };
      // Sync completed objectives from the authoritative backend payload
      // so the frontend state matches what the backend computed
      if (Array.isArray(completedArr) && completedArr.length > 0) {
        setCompletedObjectiveIndices(completedArr);
      }
      // If the student already clicked "Submit Lab", the score modal is the
      // authoritative result — suppress this SSE toast to avoid showing a
      // different number (the backend may have computed 100% from objective
      // validation while the sidebar shows the objectives-based score).
      if (!isSubmitted && !toastedCompleteRef.current) {
        toastedCompleteRef.current = true;
        toast.success(`🎉 Lab complete! Score: ${score}%`, { duration: 5000 });
      }
    }

    if (lastEvent.type === 'progress') {
      const { progress, score, completedObjectives: completedArr } = lastEvent.data as {
        progress: number;
        score: number;
        objectiveId?: number;
        completedObjectives?: number[];
      };
      console.log(`[SSEListener] progress event → score=${score}%, progress=${progress}%`, completedArr);
      // After submission the score modal is the source of truth — don't let a
      // stale SSE progress event overwrite the displayed score.
      if (!isSubmitted) {
        setLab((prev) => prev ? { ...prev, progress: progress ?? 0, score: score ?? 0 } : prev);
      }
      if (Array.isArray(completedArr)) {
        setCompletedObjectiveIndices(completedArr);
      }
    }
  }, [lastEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartLab = async () => {
    if (!id) return;

    setIsProvisioning(true);
    try {
      const updatedLab = await apiStartLab(id);
      setLab(updatedLab);
      // Fresh boot: clear local terminal + objective/toast tracking
      setTerminalHistory([]);
      setCompletedObjectiveIndices([]);
      toastedObjRef.current = new Set();
      toastedCompleteRef.current = false;
      toast.success("Lab environment started successfully!");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to start lab"));
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleStopLab = async () => {
    if (!id) return;

    try {
      const updatedLab = await apiStopLab(id);
      setLab(updatedLab);
      toast.success("Lab stopped");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to stop lab"));
    }
  };

  const handleCommand = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!commandInput.trim() || !id || !selectedDevice) return;
    // Debounce: prevent double-submit
    if (isExecuting.current) return;
    isExecuting.current = true;

    try {
      const res = await apiExecuteCommand(id, commandInput, currentDevice?.name ?? selectedDevice);
      setTerminalHistory(prev => [...prev, res.entry]);
      setCurrentPrompt(res.nextPrompt);
      setCommandInput("");
      // Apply objectives/score from the HTTP response directly (no SSE needed).
      applyCommandResult(res);
    } catch (error: unknown) {
      const msg = getErrorMessage(error, "");
      const isInstanceError =
        msg.includes("No active lab instance") ||
        msg.includes("Lab instance not found") ||
        msg.includes("Start the lab first");

      // Suppress backend session errors when the terminal is clearly working
      // (objectives have been completed or commands have already run successfully).
      // The student should never see a session error mid-session.
      const terminalIsActive = completedObjectiveIndices.length > 0 || terminalHistory.length > 0;
      if (isInstanceError && terminalIsActive) return;

      toast.error(msg || "Failed to execute command");
    } finally {
      isExecuting.current = false;
    }
  };

  const handleSubmitLab = async () => {
    if (!id || !lab) return;

    setIsProvisioning(true);

    // Calculate real score from completed objectives regardless of backend state
    const total = lab.objectives.length || 1;
    const completed = completedObjectiveIndices.length;
    const calculatedScore = Math.round((completed / total) * 100);

    try {
      // Attempt to persist to backend
      const updatedLab = await apiSaveProgress(id, calculatedScore, calculatedScore, completedObjectiveIndices);
      setLab(updatedLab);
    } catch (error: unknown) {
      // If the backend has no active instance (lab not started server-side),
      // fall back to local-only mode — the score is still valid.
      const msg = getErrorMessage(error, "");
      const isInstanceError =
        msg.includes("No active lab instance") ||
        msg.includes("Lab instance not found") ||
        msg.includes("Start the lab first");

      if (!isInstanceError || completed === 0) {
        // Unexpected error or nothing was completed — surface it
        toast.error(msg || "Failed to submit lab");
        setIsProvisioning(false);
        return;
      }
      // Otherwise: instance error but objectives were completed — continue silently
    }

    // Store result locally as a fallback record
    try {
      const key = `lab_submission_${id}`;
      localStorage.setItem(key, JSON.stringify({
        labId: id,
        score: calculatedScore,
        completedObjectives: completedObjectiveIndices,
        submittedAt: new Date().toISOString(),
      }));
    } catch {
      // localStorage unavailable — not critical
    }

    // Show modal and lock the button
    setSubmittedScore(calculatedScore);
    setIsSubmitted(true);
    setShowScoreModal(true);
    setIsProvisioning(false);
  };

  const handleRunUsefulCommand = async (cmd: string) => {
    if (!id || !selectedDevice || lab?.status !== 'running') return;
    // Debounce: prevent double-click rapid execution
    if (isExecuting.current) return;
    isExecuting.current = true;
    // Set the command in the input (instant visual feedback) and execute immediately
    setCommandInput(cmd);
    try {
      const res = await apiExecuteCommand(id, cmd, currentDevice?.name ?? selectedDevice);
      setTerminalHistory(prev => [...prev, res.entry]);
      setCurrentPrompt(res.nextPrompt);
      setCommandInput("");
      applyCommandResult(res);
    } catch (error: unknown) {
      const msg = getErrorMessage(error, "");
      const isInstanceError =
        msg.includes("No active lab instance") ||
        msg.includes("Lab instance not found") ||
        msg.includes("Start the lab first");
      const terminalIsActive = completedObjectiveIndices.length > 0 || terminalHistory.length > 0;
      if (isInstanceError && terminalIsActive) {
        setCommandInput("");
        isExecuting.current = false;
        return;
      }
      toast.error(msg || "Failed to execute command");
      setCommandInput("");
    } finally {
      isExecuting.current = false;
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'router': return <Network className="w-8 h-8" />;
      case 'switch': return <Square className="w-8 h-8" />;
      case 'pc': return <Laptop className="w-6 h-6" />;
      case 'server': return <Server className="w-6 h-6" />;
      case 'cloud': return <Cloud className="w-8 h-8" />;
      default: return <Network className="w-8 h-8" />;
    }
  };

  const getDeviceColor = (type: string) => {
    switch (type) {
      case 'router': return '#3B82F6';
      case 'switch': return '#8B5CF6';
      case 'pc': return '#10B981';
      case 'server': return '#F59E0B';
      case 'cloud': return '#6B7280';
      default: return '#3B82F6';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!lab) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading lab...</p>
        </div>
      </div>
    );
  }

  const currentDevice = lab.topology.find(node => node.id === selectedDevice);
  const completedObjectives = completedObjectiveIndices.length;
  const totalObjectives = lab.objectives.length; // always dynamic — never hardcoded

  // Live score: always derived from completed objectives so it reflects local
  // progress even when no backend UserLab session exists.
  const liveScore = totalObjectives > 0
    ? Math.round((completedObjectives / totalObjectives) * 100)
    : 0;

  // After submission, pin to the submitted value so the sidebar matches the modal.
  // Before submission, prefer liveScore (objectives-based) over lab.score (backend)
  // because the backend score may be stale or 0 when no session was created.
  const currentScore = isSubmitted
    ? submittedScore
    : Math.max(liveScore, lab.score ?? 0);

  // Color-coded score thresholds — never show red/failed for incomplete work,
  // only after the student has actually submitted.
  const scoreColor =
    currentScore >= 80 ? '#00FF41' :
    currentScore >= 50 ? '#F59E0B' :
    currentScore > 0   ? '#94A3B8' :   // some progress but low — neutral, not red
    '#475569';                          // no progress — muted

  const scoreLabel =
    currentScore >= 80 ? t('excellent') :
    currentScore >= 50 ? t('good') :
    currentScore > 0   ? t('needsWork') :
    t('notCompletedObj');

  // Submit is enabled once at least 1 objective is completed and not yet submitted
  const canSubmit = completedObjectives >= 1 && !isSubmitted;

  return (
    <div className="min-h-screen lg:h-screen bg-background flex flex-col">
      {/* Score Modal */}
      <Dialog open={showScoreModal} onOpenChange={setShowScoreModal}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              {t('labSubmitted')} ✅
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-2">
            {/* Big score */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">{t('yourScore')}</p>
              <p
                className="text-6xl font-bold font-mono tabular-nums"
                style={{
                  color: submittedScore >= 80 ? '#00FF41' : submittedScore >= 50 ? '#F59E0B' : '#EF4444',
                }}
              >
                {submittedScore}
                <span className="text-2xl text-muted-foreground"> / 100</span>
              </p>
            </div>

            {/* Objectives summary */}
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-muted-foreground mb-3">
                {t('objectivesCompleted')
                  .replace('{count}', completedObjectiveIndices.length.toString())
                  .replace('{total}', (lab?.objectives.length ?? 0).toString())}
              </p>
              {lab?.objectives.map((objective, i) => {
                const done = completedObjectiveIndices.includes(i);
                return (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00FF41] mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#EF4444] mt-0.5 shrink-0" />
                    )}
                    <span className={done ? "text-foreground" : "text-muted-foreground"}>
                      {objective}
                    </span>
                  </div>
                );
              })}
            </div>

            <Button
              className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold"
              onClick={() => setShowScoreModal(false)}
            >
              {t('close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Top Bar */}
      <header className="min-h-16 border-b border-border bg-background flex flex-wrap items-center justify-between gap-2 px-4 lg:px-6 py-2">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="hover:bg-muted">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-accent" />
            <span className="font-semibold">{lab.name}</span>
            <Badge variant="outline" className="font-mono text-xs">
              {lab.difficulty}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {lab.status === 'running' ? (
            <>
              <Badge className="bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/30">
                <div className="w-2 h-2 rounded-full bg-[#00FF41] mr-2 animate-pulse" />
                Running
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/10"
                onClick={handleStopLab}
              >
                <StopCircle className="w-4 h-4 mr-2" />
                Stop Lab
              </Button>
            </>
          ) : (
            <Button
              className="bg-[#00FF41] hover:bg-[#00DD35] text-[#0F172A]"
              onClick={handleStartLab}
              disabled={isProvisioning}
            >
              {isProvisioning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Start Lab
                </>
              )}
            </Button>
          )}
          <span className="text-sm text-muted-foreground font-mono">Time: {formatTime(elapsedTime)}</span>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
        {/* Left Panel - Instructions */}
        <div className="w-full lg:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-background lg:overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Lab Instructions</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {lab.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <span className="font-mono">{lab.category}</span>
                <span>•</span>
                <span className="font-mono">{lab.estimatedTime}</span>
              </div>
              <Progress value={lab.progress} className="mb-2" />
              <p className="text-xs text-muted-foreground">Progress: {completedObjectives}/{lab.objectives.length} objectives completed</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Objectives</h4>
              <div className="space-y-3">
                {lab.objectives.map((objective, i) => {
                  const isCompleted = completedObjectiveIndices.includes(i);
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-3 rounded-lg p-2.5 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-[#00FF41]/5 border border-[#00FF41]/20'
                          : 'bg-transparent border border-transparent'
                      }`}
                    >
                      <Checkbox
                        checked={isCompleted}
                        className="mt-0.5 shrink-0"
                        disabled
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${
                          isCompleted
                            ? 'line-through text-muted-foreground'
                            : 'text-foreground'
                        }`}>
                          {objective}
                        </p>
                        {!isCompleted && (
                          <span className="inline-block mt-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            Not completed
                          </span>
                        )}
                      </div>
                      {isCompleted
                        ? <CheckCircle2 className="w-4 h-4 text-[#00FF41] shrink-0 mt-0.5" />
                        : <div className="w-4 h-4 shrink-0 mt-0.5 rounded-full border border-border bg-card" />
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Topology & Terminal */}
        <div className="flex-1 flex flex-col lg:overflow-hidden">
          {/* Network Topology */}
          <div className="h-72 lg:h-1/2 shrink-0 border-b border-border bg-background p-4 sm:p-6 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Network Topology</h3>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="outline" className="h-7 w-7 border-border" title="Zoom out"
                  onClick={() => setTopoZoom((z) => Math.max(0.4, +(z - 0.2).toFixed(2)))}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-xs font-mono text-muted-foreground w-11 text-center">{Math.round(topoZoom * 100)}%</span>
                <Button size="icon" variant="outline" className="h-7 w-7 border-border" title="Zoom in"
                  onClick={() => setTopoZoom((z) => Math.min(2, +(z + 0.2).toFixed(2)))}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" className="h-7 w-7 border-border" title="Reset zoom"
                  onClick={() => setTopoZoom(1)}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div style={{ width: 820 * topoZoom, height: 600 * topoZoom }}>
              <div
                className="relative"
                style={{ width: 820, height: 600, transform: `scale(${topoZoom})`, transformOrigin: "0 0" }}
              >
              {/* Render connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {lab.topology.map(node =>
                  node.connections.map(targetId => {
                    const target = lab.topology.find(n => n.id === targetId);
                    if (!target) return null;
                    return (
                      <line
                        key={`${node.id}-${targetId}`}
                        x1={node.position.x + 48}
                        y1={node.position.y + 48}
                        x2={target.position.x + 48}
                        y2={target.position.y + 48}
                        stroke="#334155"
                        strokeWidth="2"
                      />
                    );
                  })
                )}
              </svg>

              {/* Render nodes */}
              {lab.topology.map(node => (
                <div
                  key={node.id}
                  className={`absolute w-24 h-24 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
                    selectedDevice === node.id
                      ? 'ring-2 ring-[#00FF41] bg-card'
                      : 'bg-card hover:bg-muted'
                  }`}
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    borderColor: getDeviceColor(node.type),
                    borderWidth: '2px',
                    borderStyle: 'solid'
                  }}
                  onClick={() => setSelectedDevice(node.id)}
                >
                  <div style={{ color: getDeviceColor(node.type) }}>
                    {getDeviceIcon(node.type)}
                  </div>
                  <span className="text-xs mt-2 font-mono">{node.name}</span>
                  {node.ip && (
                    <span className="text-[10px] text-muted-foreground font-mono">{node.ip}</span>
                  )}
                  <div
                    className={`absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-[#0F172A] ${
                      node.status === 'active' ? 'bg-[#00FF41]' :
                      node.status === 'error' ? 'bg-[#EF4444]' :
                      'bg-[#94A3B8]'
                    }`}
                  />
                </div>
              ))}
              </div>
            </div>
          </div>

          {/* Terminal */}
          <div className="h-80 lg:h-auto lg:flex-1 lg:min-h-0 bg-black flex flex-col">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] border-b border-[#334155]">
              <Terminal className="w-4 h-4 text-[#00FF41]" />
              <span className="text-sm font-mono">Web CLI Terminal - {currentDevice?.name || 'Select Device'}</span>
              <div className="flex-1" />
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <div className="w-3 h-3 rounded-full bg-[#00FF41]" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm text-[#00FF41] space-y-1">
              <div>Smart IT Lab Terminal v1.0.0</div>
              <div>Connected to {currentDevice?.name || 'No Device'}</div>
              <div>Type commands to configure the device</div>
              <div>&nbsp;</div>

              {terminalHistory
                .filter(entry => entry.device === (currentDevice?.name ?? selectedDevice))
                .map((entry) => (
                  <div key={entry.id}>
                    <div className="text-[#3B82F6]">
                      {entry.prompt || `${entry.device}>`} <span className="text-white">{entry.command}</span>
                    </div>
                    <div className={entry.isError ? 'text-[#EF4444]' : 'text-[#00FF41]'}>
                      {entry.output.split('\n').map((line, i) => (
                        <div key={i}>{line || '\u00A0'}</div>
                      ))}
                    </div>
                    <div>&nbsp;</div>
                  </div>
                ))}

              <div ref={terminalEndRef} />
            </div>

            <form onSubmit={handleCommand} className="p-4 border-t border-[#334155] bg-black flex gap-2">
              <span className="text-[#3B82F6] font-mono">{currentPrompt || `${currentDevice?.name || 'Device'}>`}</span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white font-mono"
                placeholder={lab.status === 'running' ? "Type command here..." : "Start lab to enter commands"}
                autoFocus
                disabled={lab.status !== 'running'}
              />
            </form>
          </div>

          {/* Useful Commands — quick-run strip under the terminal */}
          {lab.commands && lab.commands.length > 0 && (
            <div className="shrink-0 border-t border-border bg-card px-3 py-2">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-xs text-muted-foreground font-mono shrink-0">Useful:</span>
                {lab.commands.map((cmd, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={lab.status !== 'running'}
                    onClick={() => handleRunUsefulCommand(cmd)}
                    className="shrink-0 whitespace-nowrap text-xs font-mono text-muted-foreground bg-background px-2.5 py-1 rounded border border-border hover:text-accent hover:border-accent/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Evaluation & Feedback */}
        <div className="w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-background lg:overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* Live Validation feed */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Live Validation</h3>
              <div className="space-y-3">
                {completedObjectives > 0 ? (
                  <>
                    {completedObjectiveIndices.map((idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-[#00FF41] mt-1 shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground font-mono mb-1">
                            {new Date().toLocaleTimeString()}
                          </p>
                          <p className="text-xs text-foreground">
                            {lab.objectives[idx] ?? `Objective ${idx + 1}`}
                          </p>
                        </div>
                      </div>
                    ))}
                    {completedObjectives < lab.objectives.length && (
                      <div className="flex items-start gap-3 text-sm">
                        <div className="w-4 h-4 mt-1 shrink-0 rounded-full border border-border bg-card" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">
                            {lab.objectives.length - completedObjectives} objective
                            {lab.objectives.length - completedObjectives !== 1 ? 's' : ''} remaining
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-3 text-center">
                    <div className="w-8 h-8 rounded-full border border-border bg-card flex items-center justify-center">
                      <Terminal className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Run commands in the terminal<br />to validate objectives
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Evaluating indicator */}
            {isProvisioning && (
              <Card className="bg-[#3B82F6]/20 border-[#3B82F6]">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <div>
                      <p className="text-sm font-semibold text-primary">Evaluating Lab...</p>
                      <p className="text-xs text-muted-foreground mt-1">This may take a few moments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Current Score Card ─────────────────────────────── */}
            <div className="rounded-xl bg-card border border-border p-5 space-y-4">
              {/* Title row — always visible */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Current Score
                </span>
                {(isSubmitted || currentScore > 0 || completedObjectives > 0) && (
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                    style={{
                      color: scoreColor,
                      borderColor: scoreColor,
                      backgroundColor: `${scoreColor}1A`,
                    }}
                  >
                    {scoreLabel}
                  </span>
                )}
              </div>

              {currentScore > 0 || completedObjectives > 0 ? (
                <>
                  {/* Large animated percentage */}
                  <div
                    className="text-5xl font-bold font-mono tabular-nums leading-none transition-all duration-500"
                    style={{ color: scoreColor }}
                  >
                    {currentScore}
                    <span className="text-xl font-medium text-muted-foreground ml-0.5">%</span>
                  </div>

                  {/* Animated progress bar */}
                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${currentScore}%`,
                        backgroundColor: scoreColor,
                        boxShadow: `0 0 8px ${scoreColor}66`,
                      }}
                    />
                  </div>

                  {/* Objectives counter */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF41]" />
                      Objectives completed
                    </span>
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {completedObjectives}
                      <span className="text-muted-foreground font-normal"> / {totalObjectives}</span>
                    </span>
                  </div>
                </>
              ) : (
                /* Empty state — no progress yet */
                <div className="flex flex-col items-center justify-center py-4 gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center leading-relaxed">
                    Start completing objectives<br />to see your live score
                  </p>
                </div>
              )}
            </div>

            {/* ── Submit button ───────────────────────────────────── */}
            {isSubmitted ? (
              <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-[#00FF41]/10 border border-[#00FF41]/40">
                <CheckCircle2 className="w-4 h-4 text-[#00FF41]" />
                <span className="text-sm font-semibold text-[#00FF41]">Submitted</span>
              </div>
            ) : (
              <Button
                className="w-full font-semibold transition-all duration-300 disabled:opacity-40"
                style={
                  canSubmit && !isProvisioning && lab.status === 'running'
                    ? { backgroundColor: '#16A34A', color: '#FFFFFF' }
                    : { backgroundColor: '#1E293B', color: '#64748B', border: '1px solid #334155' }
                }
                onClick={handleSubmitLab}
                disabled={isProvisioning || lab.status !== 'running' || !canSubmit}
              >
                {isProvisioning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Lab
                  </>
                )}
              </Button>
            )}
            {!canSubmit && !isSubmitted && lab.status === 'running' && (
              <p className="text-xs text-muted-foreground text-center -mt-2">
                Complete at least 1 objective to submit
              </p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
