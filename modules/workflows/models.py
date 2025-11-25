"""
Workflow Models - MEGA PHASE v15
Defines workflow schema and step types (JSON-serializable)
"""
from enum import Enum
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional
import uuid
import time


class StepType(str, Enum):
    HTTP_REQUEST = "http_request"
    EMAIL = "email"
    DELAY = "delay"
    CONDITION = "condition"
    LOG = "log"


class RunStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class WorkflowStep:
    id: str
    type: StepType
    config: Dict[str, Any]
    next_step_ids: List[str] = field(default_factory=list)
    name: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "type": self.type.value if isinstance(self.type, StepType) else self.type,
            "config": self.config,
            "next_step_ids": self.next_step_ids,
            "name": self.name
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'WorkflowStep':
        step_type = data.get("type", "log")
        if isinstance(step_type, str):
            step_type = StepType(step_type)
        return cls(
            id=data.get("id", str(uuid.uuid4())),
            type=step_type,
            config=data.get("config", {}),
            next_step_ids=data.get("next_step_ids", []),
            name=data.get("name", "")
        )


@dataclass
class ScheduleConfig:
    enabled: bool = False
    interval_minutes: int = 60
    cron_expression: str = ""
    last_run_at: float = 0
    next_run_at: float = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ScheduleConfig':
        return cls(
            enabled=data.get("enabled", False),
            interval_minutes=data.get("interval_minutes", 60),
            cron_expression=data.get("cron_expression", ""),
            last_run_at=data.get("last_run_at", 0),
            next_run_at=data.get("next_run_at", 0)
        )


@dataclass
class Workflow:
    id: str
    name: str
    description: str
    steps: List[WorkflowStep]
    owner_id: str = ""
    tenant_id: str = "default"
    is_active: bool = False
    schedule_config: Optional[ScheduleConfig] = None
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "steps": [s.to_dict() for s in self.steps],
            "owner_id": self.owner_id,
            "tenant_id": self.tenant_id,
            "is_active": self.is_active,
            "schedule_config": self.schedule_config.to_dict() if self.schedule_config else None,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Workflow':
        steps_data = data.get("steps", [])
        steps = [WorkflowStep.from_dict(s) for s in steps_data]
        
        schedule_data = data.get("schedule_config")
        schedule = ScheduleConfig.from_dict(schedule_data) if schedule_data else None
        
        return cls(
            id=data.get("id", str(uuid.uuid4())),
            name=data.get("name", "Untitled Workflow"),
            description=data.get("description", ""),
            steps=steps,
            owner_id=data.get("owner_id", ""),
            tenant_id=data.get("tenant_id", "default"),
            is_active=data.get("is_active", False),
            schedule_config=schedule,
            created_at=data.get("created_at", time.time()),
            updated_at=data.get("updated_at", time.time())
        )


@dataclass
class WorkflowRun:
    id: str
    workflow_id: str
    status: RunStatus
    started_at: float
    ended_at: Optional[float] = None
    context: Dict[str, Any] = field(default_factory=dict)
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "workflow_id": self.workflow_id,
            "status": self.status.value if isinstance(self.status, RunStatus) else self.status,
            "started_at": self.started_at,
            "ended_at": self.ended_at,
            "context": self.context,
            "result": self.result,
            "error": self.error
        }
