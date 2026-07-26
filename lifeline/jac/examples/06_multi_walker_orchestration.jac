"""Example 06 — Multi-walker orchestration

Mirrors Lifeline's pipeline: ingest → verify → allocate (stubs in-sequence).
Run: jac run examples/06_multi_walker_orchestration.jac
"""

node Ticket {
    has text: str = "",
        confidence: float = 0.0,
        allocated: bool = False;
}

walker stage_ingest {
    has text: str = "";
    with Root entry {
        here ++ Ticket(text=.text, confidence=0.0, allocated=False);
        print("[ingest] ticket created");
    }
}

walker stage_verify {
    with Root entry {
        visit [-->(`?Ticket)];
    }
    with Ticket entry {
        here.confidence = 0.72;
        print("[verify] confidence ->", here.confidence);
    }
}

walker stage_allocate {
    with Root entry {
        visit [-->(`?Ticket)];
    }
    with Ticket entry {
        if here.confidence >= 0.5 {
            here.allocated = True;
            print("[allocate] resources assigned");
        }
    }
}

walker orchestrate {
    has text: str = "Bridge down; hospital needs generator";
    with Root entry {
        root spawn stage_ingest(text=.text);
        root spawn stage_verify;
        root spawn stage_allocate;
        print("Multi-walker orchestration complete.");
    }
}

with entry {
    root spawn orchestrate;
}
