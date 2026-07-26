"""SupplyDepot — warehouse / staging area that `supplies` Resources and Vehicles."""

node SupplyDepot {
    has name: str = "",
        location: str = "",
        operational: bool = True,
        staging_capacity: int = 0,
        notes: str = "";
}
