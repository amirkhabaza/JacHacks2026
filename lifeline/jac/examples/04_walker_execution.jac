"""Example 04 — Walker execution

Walkers are mobile intelligence. This walker counts nodes and reports a score.
Run: jac run examples/04_walker_execution.jac
"""

node Asset {
    has label: str = "",
        critical: bool = False;
}

walker score_assets {
    has total: int = 0,
        critical_count: int = 0;

    with Root entry {
        here ++ Asset(label="Generator", critical=True);
        here ++ Asset(label="Tent", critical=False);
        here ++ Asset(label="Oxygen", critical=True);
        visit [-->(`?Asset)];
    }

    with Asset entry {
        .total += 1;
        if here.critical {
            .critical_count += 1;
        }
    }
}

with entry {
    w = root spawn score_assets;
    print("Assets:", w.total, "critical:", w.critical_count);
}
