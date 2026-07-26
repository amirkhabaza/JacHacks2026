"""Vehicle — ambulance, fire truck, UAV, supply truck, etc."""

node Vehicle {
    has name: str = "",
        # ambulance | fire | police | supply | uav | other
        kind: str = "ambulance",
        location: str = "",
        # available | assigned | en_route | offline
        status: str = "available",
        fuel_level: float = 1.0,
        crew_size: int = 0,
        notes: str = "";
}
