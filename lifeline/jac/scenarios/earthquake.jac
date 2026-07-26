"""earthquake scenario seeder — demo graph for JacHacks.

Story:
  - Hospital loses power
  - Bridge collapses
  - Anonymous report claims bridge is open (contradiction)
  - Shelter requires oxygen
  - Ambulance available
  - Generator available at SupplyDepot

TODO: flesh out full node/edge creation under Root.
"""

import from ..nodes.Incident { Incident }
import from ..nodes.Report { Report }
import from ..nodes.Source { Source }
import from ..nodes.Hospital { Hospital }
import from ..nodes.Shelter { Shelter }
import from ..nodes.Bridge { Bridge }
import from ..nodes.Road { Road }
import from ..nodes.Vehicle { Vehicle }
import from ..nodes.Resource { Resource }
import from ..nodes.SupplyDepot { SupplyDepot }
import from ..nodes.CitizenGroup { CitizenGroup }

"""Attach the earthquake demo subgraph under `here` (typically Root)."""
def:pub seed_earthquake(here: Root) -> Incident {
    # TODO: create Incident("Bay District Quake")
    # TODO: Hospital(has_power=False) depends_on generator Resource
    # TODO: Bridge(status="collapsed") connected_to Road → Hospital
    # TODO: Report A (sensor): bridge collapsed
    # TODO: Report B (anonymous): bridge open  → contradicts
    # TODO: Shelter requires oxygen; SupplyDepot supplies oxygen + generator
    # TODO: Vehicle ambulance status=available
    print("seed_earthquake stub — graph not yet materialized");
    return Incident(
        title="Bay District Quake",
        description="Stub incident — implement seed_earthquake",
        status="investigating",
        severity=0.8,
        location="Bay District"
    );
}
