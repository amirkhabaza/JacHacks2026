"""allocate_resources — match available Resources/Vehicles to requires edges.

Creates assigned_to edges with priority + ETA + rationale stubs.
Greedy / constraint solver can live here later — still Jac-side.
"""

import from ..nodes.Resource { Resource }
import from ..nodes.Vehicle { Vehicle }
import from ..nodes.Shelter { Shelter }
import from ..nodes.Hospital { Hospital }
import from ..edges.requires { requires }
import from ..edges.assigned_to { assigned_to }

walker:pub allocate_resources {
    has incident_id: str = "",
        assignments: list[dict] = [],
        unmet: list[dict] = [];

    with Root entry {
        # TODO: collect open requires edges under Incident subgraph
        # TODO: collect available Resource / Vehicle nodes
        # TODO: greedy match by urgency × proximity (connected_to distances)
        # TODO: ++ assigned_to; mark requires.satisfied when fully covered
        .assignments = [];
        .unmet = [];
    }

    with Resource entry {
        # TODO: candidate if status == available
    }

    with Vehicle entry {
        # TODO: candidate if status == available
    }

    with Shelter entry {
        # TODO: emit needs from requires edges
    }

    with Hospital entry {
        # TODO: emit needs from requires / power loss
    }
}
