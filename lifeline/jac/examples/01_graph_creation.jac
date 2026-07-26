"""Example 01 — Graph creation

Creates a tiny crisis subgraph under Root to show Jac nodes as first-class state.
Run: jac run examples/01_graph_creation.jac
"""

node DemoHospital {
    has name: str = "",
        has_power: bool = True;
}

node DemoBridge {
    has name: str = "",
        status: str = "open";
}

walker create_mini_graph {
    with Root entry {
        h = here ++ DemoHospital(name="Clinic A", has_power=False);
        b = here ++ DemoBridge(name="Main St Bridge", status="collapsed");
        print("Created hospital:", h.name, "power=", h.has_power);
        print("Created bridge:", b.name, "status=", b.status);
        print("Graph creation example complete.");
    }
}

with entry {
    root spawn create_mini_graph;
}
