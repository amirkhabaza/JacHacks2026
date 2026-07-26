"""connected_to — bidirectional-ish topology between Roads, Bridges, facilities."""

edge connected_to {
    has distance_km: float = 0.0,
        travel_minutes: float = 0.0,
        notes: str = "";
}
