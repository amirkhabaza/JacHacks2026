"""Resource — fungible or tagged supply unit (generator, oxygen tanks, water)."""

node Resource {
    has name: str = "",
        # generator | oxygen | water | food | medicine | fuel | other
        kind: str = "other",
        quantity: float = 0.0,
        unit: str = "units",
        location: str = "",
        # available | reserved | depleted | in_transit
        status: str = "available",
        notes: str = "";
}
