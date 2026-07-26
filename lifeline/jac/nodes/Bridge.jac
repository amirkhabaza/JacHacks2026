"""Bridge — structural link; collapse cascades to Roads and access-dependent nodes."""

node Bridge {
    has name: str = "",
        location: str = "",
        # open | damaged | collapsed | closed
        status: str = "open",
        lanes: int = 2,
        load_rating: float = 1.0,
        notes: str = "";
}
