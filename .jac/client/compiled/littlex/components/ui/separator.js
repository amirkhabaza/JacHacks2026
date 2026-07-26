/* Source: /Users/amirkhabaza/JacHacks2026/littlex/components/ui/separator.jac */
import {__jacJsx, __jacSpawn} from "@jac/runtime";
import { Separator as SeparatorPrimitive } from "radix-ui";
import { cn } from "../../lib/utils.js";
function Separator(props) {
  let orientation = (props["orientation"] || "horizontal");
  let decorative = props["decorative"];
  if ((decorative === null)) {
    decorative = true;
  }
  return __jacJsx(SeparatorPrimitive.Root, Object.assign({}, props, {"data-slot": "separator"}, {"decorative": decorative}, {"orientation": orientation}, {"className": cn("bg-border shrink-0 data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch", props["className"])}), []);
}
/*jac:refresh-boundary*/;
export {Separator};
//# sourceMappingURL=separator.js.map
