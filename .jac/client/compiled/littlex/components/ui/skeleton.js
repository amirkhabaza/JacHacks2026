/* Source: /Users/amirkhabaza/JacHacks2026/littlex/components/ui/skeleton.jac */
import {__jacJsx, __jacSpawn} from "@jac/runtime";
import { cn } from "../../lib/utils.js";
function Skeleton(props) {
  let attrs = {...props};
  return __jacJsx("div", Object.assign({}, attrs, {"data-slot": "skeleton"}, {"className": cn("bg-muted rounded-md animate-pulse", props["className"])}), []);
}
/*jac:refresh-boundary*/;
export {Skeleton};
//# sourceMappingURL=skeleton.js.map
