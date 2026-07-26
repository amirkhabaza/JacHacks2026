"""Example 02 — Node traversal

Shows a walker visiting related nodes via `visit` (object-spatial programming).
Run: jac run examples/02_node_traversal.jac
"""

node Site {
    has name: str = "";
}

edge Path {}

walker traverse_sites {
    has log: list[str] = [];

    with Root entry {
        a = here ++ Site(name="Depot");
        b = here ++ Site(name="Shelter");
        c = here ++ Site(name="Hospital");
        a ++ Path ++ b;
        b ++ Path ++ c;
        visit [a];
    }

    with Site entry {
        .log.add(here.name);
        print("Visiting:", here.name);
        visit [-->];
    }
}

with entry {
    w = root spawn traverse_sites;
    print("Traversal order:", w.log);
}
