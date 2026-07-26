"""Example 03 — Edge creation

Typed edges carry relationship semantics (Lifeline: corroborates, depends_on, …).
Run: jac run examples/03_edge_creation.jac
"""

node Claim {
    has text: str = "";
}

edge Agrees {
    has strength: float = 0.0;
}

edge Conflicts {
    has strength: float = 0.0;
}

walker link_claims {
    with Root entry {
        r1 = here ++ Claim(text="Bridge collapsed");
        r2 = here ++ Claim(text="Bridge is open");
        r3 = here ++ Claim(text="Bridge structural failure confirmed");
        r1 ++ Agrees(strength=0.9) ++ r3;
        r1 ++ Conflicts(strength=0.95) ++ r2;
        print("Edges created: Agrees + Conflicts (verification primitives).");
    }
}

with entry {
    root spawn link_claims;
}
