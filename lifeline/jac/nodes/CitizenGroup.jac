"""CitizenGroup — affected population cluster needing aid or evacuation."""

node CitizenGroup {
    has name: str = "",
        location: str = "",
        population: int = 0,
        # stable | at_risk | critical | evacuated
        status: str = "at_risk",
        needs: list[str] = [],
        notes: str = "";
}
