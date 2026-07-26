"""MongoDB connectivity via Motor. No business logic."""

from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase


class MongoDBService:
    """Thin async MongoDB client wrapper for health checks and later audit storage."""

    def __init__(self, uri: str, database_name: str) -> None:
        self._uri = uri
        self._database_name = database_name
        self._client: AsyncIOMotorClient | None = None
        self._database: AsyncIOMotorDatabase | None = None

    @property
    def database(self) -> AsyncIOMotorDatabase:
        if self._database is None:
            raise RuntimeError(
                "MongoDB is not initialized. Call connect() before accessing the database."
            )
        return self._database

    async def connect(self) -> None:
        """Create the Motor client and verify connectivity with a ping."""
        client = AsyncIOMotorClient(
            self._uri,
            serverSelectionTimeoutMS=2000,
        )
        try:
            await client.admin.command("ping")
        except Exception as exc:
            client.close()
            raise RuntimeError(f"MongoDB ping failed for {self._uri}") from exc

        self._client = client
        self._database = client[self._database_name]

    async def disconnect(self) -> None:
        """Close the Motor client if it was opened."""
        if self._client is not None:
            self._client.close()
        self._client = None
        self._database = None

    async def ping(self) -> bool:
        """Return True when MongoDB responds to ping.

        If the client was never connected (Mongo was down at startup),
        attempt a reconnect so health recovers without restarting the API.
        """
        if self._client is None:
            try:
                await self.connect()
                return True
            except Exception:
                return False
        try:
            await self._client.admin.command("ping")
            return True
        except Exception:
            return False
