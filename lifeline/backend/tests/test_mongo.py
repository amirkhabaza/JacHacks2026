"""MongoDB audit-store tests without requiring a running database."""

from app.services.mongo import MongoStore


class FakeCollection:
    def __init__(self) -> None:
        self.documents: list[dict] = []

    def create_index(self, _field: str) -> None:
        return None

    def insert_one(self, document: dict) -> None:
        self.documents.append(document)


class FakeDatabase:
    def __init__(self) -> None:
        self.events = FakeCollection()
        self.snapshots = FakeCollection()


class FakeAdmin:
    def command(self, command: str) -> dict[str, int]:
        assert command == "ping"
        return {"ok": 1}


class FakeClient:
    def __init__(self) -> None:
        self.admin = FakeAdmin()
        self.database = FakeDatabase()
        self.closed = False

    def __getitem__(self, _name: str) -> FakeDatabase:
        return self.database

    def close(self) -> None:
        self.closed = True


def test_mongo_store_connects_and_persists(monkeypatch) -> None:
    fake_client = FakeClient()
    monkeypatch.setattr(
        "app.services.mongo.MongoClient",
        lambda *_args, **_kwargs: fake_client,
    )
    store = MongoStore()

    assert store.connect() is True
    assert store.health() == "ready"

    store.append_event({"type": "report_ingested"})
    store.save_snapshot({"incident_id": "incident-1"})

    assert fake_client.database.events.documents[0]["type"] == "report_ingested"
    assert "created_at" in fake_client.database.events.documents[0]
    assert fake_client.database.snapshots.documents[0]["incident_id"] == "incident-1"
    assert "captured_at" in fake_client.database.snapshots.documents[0]

    store.close()
    assert fake_client.closed is True
