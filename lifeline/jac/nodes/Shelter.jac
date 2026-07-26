"""Shelter — evacuation / temporary housing site with resource requirements."""

node Shelter {
    has name: str = "",
        location: str = "",
        capacity: int = 0,
        occupied: int = 0,
        requires_oxygen: bool = False,
        requires_water: bool = False,
        operational: bool = True,
        notes: str = "";
}
