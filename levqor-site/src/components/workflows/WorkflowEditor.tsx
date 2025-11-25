"use client";
import { useState, useEffect, useCallback } from "react";
import { useLevqorBrain } from "@/components/brain";

interface WorkflowStep {
  id: string;
  type: string;
  name: string;
  config: Record<string, unknown>;
  next_step_ids: string[];
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  is_active: boolean;
  created_at: number;
  updated_at: number;
}

interface WorkflowEditorProps {
  workflowId: string;
  onClose?: () => void;
  onSave?: (workflow: Workflow) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

const stepTypeLabels: Record<string, string> = {
  http_request: "HTTP Request",
  email: "Send Email",
  delay: "Wait/Delay",
  condition: "Condition",
  log: "Log Message"
};

const stepTypeIcons: Record<string, string> = {
  http_request: "🌐",
  email: "📧",
  delay: "⏱️",
  condition: "🔀",
  log: "📝"
};

const stepTypeColors: Record<string, string> = {
  http_request: "border-blue-400 bg-blue-50",
  email: "border-purple-400 bg-purple-50",
  delay: "border-amber-400 bg-amber-50",
  condition: "border-cyan-400 bg-cyan-50",
  log: "border-slate-400 bg-slate-50"
};

function WorkflowNode({ 
  step, 
  isSelected, 
  onClick,
  onUpdate
}: { 
  step: WorkflowStep; 
  isSelected: boolean;
  onClick: () => void;
  onUpdate: (updates: Partial<WorkflowStep>) => void;
}) {
  const colorClass = stepTypeColors[step.type] || "border-gray-400 bg-gray-50";
  
  return (
    <div 
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${colorClass} ${
        isSelected ? "ring-2 ring-primary-500 shadow-lg" : "hover:shadow-md"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{stepTypeIcons[step.type] || "📋"}</span>
        <span className="font-medium text-sm text-slate-700">
          {stepTypeLabels[step.type] || step.type}
        </span>
      </div>
      
      <input
        type="text"
        value={step.name || `Step ${step.id.slice(0, 8)}`}
        onChange={(e) => onUpdate({ name: e.target.value })}
        onClick={(e) => e.stopPropagation()}
        className="w-full text-sm font-semibold bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary-300 rounded px-1"
        placeholder="Step name"
      />
      
      <div className="text-xs text-slate-500 mt-1 truncate">
        {step.type === "http_request" && step.config.url ? (
          <span>{String(step.config.method || "GET")} {String(step.config.url).slice(0, 30)}...</span>
        ) : null}
        {step.type === "delay" && step.config.seconds ? (
          <span>Wait {String(step.config.seconds)}s</span>
        ) : null}
        {step.type === "email" && step.config.to ? (
          <span>To: {String(step.config.to).slice(0, 25)}...</span>
        ) : null}
        {step.type === "log" && step.config.message ? (
          <span>{String(step.config.message).slice(0, 30)}...</span>
        ) : null}
      </div>
    </div>
  );
}

function StepConfigPanel({ 
  step, 
  onUpdate,
  onClose
}: { 
  step: WorkflowStep; 
  onUpdate: (updates: Partial<WorkflowStep>) => void;
  onClose: () => void;
}) {
  const [config, setConfig] = useState(step.config);
  
  const handleConfigChange = (key: string, value: unknown) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdate({ config: newConfig });
  };
  
  return (
    <div className="bg-white border rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">
          {stepTypeIcons[step.type]} {stepTypeLabels[step.type] || step.type}
        </h3>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          &times;
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Step Name</label>
          <input
            type="text"
            value={step.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            placeholder="Enter step name"
          />
        </div>
        
        {step.type === "http_request" && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
              <input
                type="text"
                value={String(config.url || "")}
                onChange={(e) => handleConfigChange("url", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                placeholder="https://api.example.com/endpoint"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Method</label>
              <select
                value={String(config.method || "GET")}
                onChange={(e) => handleConfigChange("method", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </>
        )}
        
        {step.type === "delay" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Delay (seconds)</label>
            <input
              type="number"
              value={Number(config.seconds || 0)}
              onChange={(e) => handleConfigChange("seconds", parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              min={0}
              max={3600}
            />
          </div>
        )}
        
        {step.type === "email" && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
              <input
                type="email"
                value={String(config.to || "")}
                onChange={(e) => handleConfigChange("to", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                placeholder="recipient@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={String(config.subject || "")}
                onChange={(e) => handleConfigChange("subject", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                placeholder="Email subject"
              />
            </div>
          </>
        )}
        
        {step.type === "log" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
            <textarea
              value={String(config.message || "")}
              onChange={(e) => handleConfigChange("message", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Log message"
            />
          </div>
        )}
        
        {step.type === "condition" && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Field</label>
              <input
                type="text"
                value={String(config.field || "")}
                onChange={(e) => handleConfigChange("field", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                placeholder="context.field_name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Operator</label>
              <select
                value={String(config.operator || "equals")}
                onChange={(e) => handleConfigChange("operator", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="contains">Contains</option>
                <option value="greater_than">Greater Than</option>
                <option value="less_than">Less Than</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Value</label>
              <input
                type="text"
                value={String(config.value || "")}
                onChange={(e) => handleConfigChange("value", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                placeholder="Expected value"
              />
            </div>
          </>
        )}
      </div>
      
      <div className="mt-4 p-3 bg-amber-50 rounded-lg text-xs text-amber-800">
        Note: Email steps and external HTTP requests require approval before execution.
      </div>
    </div>
  );
}

export default function WorkflowEditor({ workflowId, onClose, onSave }: WorkflowEditorProps) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  const brain = useLevqorBrain();
  
  useEffect(() => {
    if (workflowId) {
      brain?.setNeural?.();
    }
  }, [workflowId, brain]);
  
  const fetchWorkflow = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/workflows/${workflowId}`);
      
      if (!res.ok) {
        throw new Error("Failed to load workflow");
      }
      
      const data = await res.json();
      setWorkflow(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workflow");
    } finally {
      setLoading(false);
    }
  }, [workflowId]);
  
  useEffect(() => {
    if (workflowId) {
      fetchWorkflow();
    }
  }, [workflowId, fetchWorkflow]);
  
  const handleUpdateWorkflowName = (name: string) => {
    if (!workflow) return;
    setWorkflow({ ...workflow, name });
    setHasChanges(true);
  };
  
  const handleUpdateWorkflowDescription = (description: string) => {
    if (!workflow) return;
    setWorkflow({ ...workflow, description });
    setHasChanges(true);
  };
  
  const handleUpdateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    if (!workflow) return;
    
    const updatedSteps = workflow.steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    );
    
    setWorkflow({ ...workflow, steps: updatedSteps });
    setHasChanges(true);
  };
  
  const handleSave = async () => {
    if (!workflow) return;
    
    try {
      setSaving(true);
      brain?.setNeural?.();
      
      const res = await fetch(`${API_BASE}/api/workflows/${workflowId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workflow.name,
          description: workflow.description,
          steps: workflow.steps
        })
      });
      
      if (!res.ok) {
        throw new Error("Failed to save workflow");
      }
      
      const data = await res.json();
      
      if (data.pending_approval) {
        setError("Changes contain critical operations and require approval.");
      } else {
        setHasChanges(false);
        brain?.setSuccess?.();
        onSave?.(workflow);
      }
    } catch (err) {
      brain?.setError?.();
      setError(err instanceof Error ? err.message : "Failed to save workflow");
    } finally {
      setSaving(false);
    }
  };
  
  const selectedStep = workflow?.steps.find(s => s.id === selectedStepId);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (error && !workflow) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchWorkflow}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-500">Workflow not found</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex-1 mr-4">
          <input
            type="text"
            value={workflow.name}
            onChange={(e) => handleUpdateWorkflowName(e.target.value)}
            className="text-xl font-bold w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary-300 rounded px-1"
            placeholder="Workflow name"
          />
          <input
            type="text"
            value={workflow.description}
            onChange={(e) => handleUpdateWorkflowDescription(e.target.value)}
            className="text-sm text-slate-500 w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary-300 rounded px-1 mt-1"
            placeholder="Add a description..."
          />
        </div>
        
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-sm text-amber-600">Unsaved changes</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              hasChanges 
                ? "bg-primary-600 text-white hover:bg-primary-700" 
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium text-sm hover:bg-slate-200"
            >
              Close
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          {error}
        </div>
      )}
      
      <div className="p-4">
        <div className="flex gap-6">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Workflow Steps</h3>
            
            {workflow.steps.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed">
                <p className="text-slate-500 mb-2">No steps in this workflow</p>
                <p className="text-sm text-slate-400">Add steps using the AI builder</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workflow.steps.map((step, index) => (
                  <div key={step.id} className="relative">
                    {index > 0 && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="w-px h-3 bg-slate-300"></div>
                        <div className="text-slate-400 text-xs">&#8595;</div>
                      </div>
                    )}
                    <WorkflowNode
                      step={step}
                      isSelected={selectedStepId === step.id}
                      onClick={() => setSelectedStepId(step.id === selectedStepId ? null : step.id)}
                      onUpdate={(updates) => handleUpdateStep(step.id, updates)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {selectedStep && (
            <div className="w-80">
              <StepConfigPanel
                step={selectedStep}
                onUpdate={(updates) => handleUpdateStep(selectedStep.id, updates)}
                onClose={() => setSelectedStepId(null)}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t bg-slate-50 flex items-center justify-between text-xs text-slate-500">
        <span>ID: {workflow.id.slice(0, 8)}...</span>
        <span>
          Last updated: {new Date(workflow.updated_at * 1000).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
