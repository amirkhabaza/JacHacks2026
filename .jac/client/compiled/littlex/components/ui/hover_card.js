/* Source: /Users/amirkhabaza/JacHacks2026/littlex/components/ui/hover_card.jac */
import {__jacJsx, __jacSpawn} from "@jac/runtime";
import { HoverCard as HoverCardPrimitive } from "radix-ui";
import { cn } from "../../lib/utils.js";
function HoverCard(props) {
  return __jacJsx(HoverCardPrimitive.Root, Object.assign({}, {"data-slot": "hover-card"}, props), []);
}
function HoverCardTrigger(props) {
  return __jacJsx(HoverCardPrimitive.Trigger, Object.assign({}, {"data-slot": "hover-card-trigger"}, props), []);
}
function HoverCardContent(props) {
  let align = (props["align"] || "center");
  let sideOffset = (props["sideOffset"] || 4);
  return __jacJsx(HoverCardPrimitive.Portal, {"data-slot": "hover-card-portal"}, [__jacJsx(HoverCardPrimitive.Content, Object.assign({}, props, {"data-slot": "hover-card-content"}, {"align": align}, {"sideOffset": sideOffset}, {"className": cn("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground w-64 rounded-lg p-2.5 text-sm shadow-md ring-1 duration-100 z-50 origin-(--radix-hover-card-content-transform-origin) outline-hidden", props["className"])}), [])]);
}
/*jac:refresh-boundary*/;
export {HoverCard, HoverCardContent, HoverCardTrigger};
//# sourceMappingURL=hover_card.js.map
