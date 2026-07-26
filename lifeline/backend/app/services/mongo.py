"""Optional MongoDB mirroring for audit / offline replay.

The Jac graph remains source of truth. Mongo stores event logs + snapshots only.
"""

from __future__ import annotations

import os
from typing import Any


class MongoStore:
    def __init__(self) -> None:
        self.uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        self.db_name = os.getenv("MONGODB_DB", "lifeline")
        self._client: Any = None

    def connect(self) -> None:
        # TODO: from pymongo import MongoClient; self._client = MongoClient(self.uri)
        pass

    def health(self) -> str:
        # TODO: ping primary
        return "stub"

    def append_event(self, event: dict[str, Any]) -> None:
        # TODO: insert into events collection
        _ = event

    def save_snapshot(self, snapshot: dict[str, Any]) -> None:
        # TODO: insert into snapshots collection
        _ = snapshot


mongo_store = MongoStore()
