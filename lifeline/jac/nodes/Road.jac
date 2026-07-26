"""Road — ground corridor; may depend_on Bridge / other Road segments."""

node Road {
    has name: str = "",
        location: str = "",
        # open | congested | blocked | washed_out
        status: str = "open",
        length_km: float = 0.0,
        notes: str = "";
}
