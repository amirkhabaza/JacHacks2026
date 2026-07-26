"""Mocked Jac bridge for checkpoint one.

TODO: Replace mock methods with real Jac runtime invocation
(load jac_project_path / jac_entrypoint, spawn walkers).
Humanitarian decision logic must stay in Jac — never in Python.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


class JacExecutionError(RuntimeError):
    """Raised when a Jac walker execution fails."""


@dataclass(slots=True)
class JacExecutionResult:
    walker: str
    success: bool
    data: dict[str, Any]
    duration_ms: int | None = None


class JacBridge:
    """Adapter between FastAPI and the Jac graph engine.

    Checkpoint one: mocked. Later milestones will invoke the Jac runtime here.
    """

    def __init__(self, project_path: str, entrypoint: str) -> None:
        self._project_path = project_path
        self._entrypoint = entrypoint

    async def health_check(self) -> bool:
        """Return True when the Jac bridge is reachable.

        TODO: Probe the real Jac runtime / loaded module instead of returning True.
        """
        return True

    async def execute_walker(
        self,
        walker: str,
        payload: dict[str, Any] | None = None,
    ) -> JacExecutionResult:
        """Execute a Jac walker and return a typed result.

        TODO: Invoke the Jac runtime to spawn `walker` with `payload`.
        Do not implement crisis decision logic in this method.
        """
        return JacExecutionResult(
            walker=walker,
            success=True,
            data={
                "mock": True,
                "message": "Jac bridge is mocked for checkpoint one",
                "project_path": self._project_path,
                "entrypoint": self._entrypoint,
                "payload": payload or {},
            },
            duration_ms=0,
        )
