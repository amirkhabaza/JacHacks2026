"""propagate_failures — cascade infrastructure outages along depends_on.

Example: Bridge collapsed → Road blocked → Hospital inaccessible →
CitizenGroup at_risk elevated.

Records affects edges and traversal path for the live React Flow timeline.
"""

import from ..nodes.Bridge { Bridge }
import from ..nodes.Road { Road }
import from ..nodes.Hospital { Hospital }
import from ..nodes.Shelter { Shelter }
import from ..edges.depends_on { depends_on }
import from ..edges.affects { affects }

walker:pub propagate_failures {
    has seed_node_id: str = "",
        max_depth: int = 8,
        path: list[str] = [],
        cascaded: list[str] = [];

    with Root entry {
        # TODO: start at damaged Bridge/Road/Resource and BFS/DFS via depends_on
        .path = [];
        .cascaded = [];
    }

    with Bridge entry {
        # TODO: if status == collapsed/damaged, visit connected Road / dependents
    }

    with Road entry {
        # TODO: mark blocked; visit dependents (Hospital access, etc.)
    }

    with Hospital entry {
        # TODO: flip operational / has_power based on unmet depends_on
    }

    with Shelter entry {
        # TODO: escalate unmet requires after access loss
    }
}
