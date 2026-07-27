"""Optional MongoDB mirroring for audit / offline replay.

The Jac graph remains source of truth. Mongo stores event logs + snapshots only.
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import PyMongoError

load_dotenv(Path(__file__).resolve().parents[3] / ".env")


class MongoStore:
    def __init__(self) -> None:
        self.uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        self.db_name = os.getenv("MONGODB_DB", "lifeline")
        self._client: MongoClient[dict[str, Any]] | None = None
        self._db: Database[dict[str, Any]] | None = None
        self._last_error = ""

    def connect(self) -> bool:
        """Connect and verify MongoDB without making it a hard dependency."""
        if self._client is not None and self._db is not None:
            return True

        client: MongoClient[dict[str, Any]] = MongoClient(
            self.uri,
            serverSelectionTimeoutMS=2000,
            connectTimeoutMS=2000,
        )
        try:
            client.admin.command("ping")
            database = client[self.db_name]
            database.events.create_index("created_at")
            database.snapshots.create_index("captured_at")
        except PyMongoError as exc:
            client.close()
            self._last_error = str(exc)
            return False

        self._client = client
        self._db = database
        self._last_error = ""
        return True

    def close(self) -> None:
        if self._client is not None:
            self._client.close()
        self._client = None
        self._db = None

    def health(self) -> str:
        if not self.connect():
            return "unavailable"
        try:
            assert self._client is not None
            self._client.admin.command("ping")
            return "ready"
        except PyMongoError as exc:
            self._last_error = str(exc)
            self.close()
            return "unavailable"

    def append_event(self, event: dict[str, Any]) -> None:
        if not self.connect():
            return
        try:
            assert self._db is not None
            self._db.events.insert_one(
                {**event, "created_at": datetime.now(timezone.utc)}
            )
        except PyMongoError as exc:
            self._last_error = str(exc)

    def save_snapshot(self, snapshot: dict[str, Any]) -> None:
        if not self.connect():
            return
        try:
            assert self._db is not None
            self._db.snapshots.insert_one(
                {**snapshot, "captured_at": datetime.now(timezone.utc)}
            )
        except PyMongoError as exc:
            self._last_error = str(exc)


mongo_store = MongoStore()
