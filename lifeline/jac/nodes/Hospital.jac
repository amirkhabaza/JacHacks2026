"""Hospital — critical care facility; often depends_on power / roads / oxygen."""

node Hospital {
    has name: str = "",
        location: str = "",
        capacity: int = 0,
        occupied: int = 0,
        has_power: bool = True,
        has_oxygen: bool = True,
        operational: bool = True,
        notes: str = "";

    # TODO: derive operational from depends_on edges during propagate_failures
}
