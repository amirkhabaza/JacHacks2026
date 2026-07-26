"""requires — Shelter/Hospital/CitizenGroup → Resource kind need."""

edge requires {
    has quantity: float = 0.0,
        unit: str = "units",
        urgency: float = 0.0,   # 0.0–1.0
        satisfied: bool = False,
        notes: str = "";
}
