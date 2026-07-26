"""depends_on — consumer → dependency (Hospital → power Resource, Road → Bridge).

Used by propagate_failures to cascade outages.
"""

edge depends_on {
    has critical: bool = True,
        dependency_kind: str = "",   # power | access | oxygen | water | staff
        notes: str = "";
}
