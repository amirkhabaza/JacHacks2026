"""assigned_to — Resource/Vehicle → Hospital/Shelter/CitizenGroup/Incident."""

edge assigned_to {
    has priority: int = 0,
        assigned_at: str = "",
        eta_minutes: float = 0.0,
        rationale: str = "";
}
