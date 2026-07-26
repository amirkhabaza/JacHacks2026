/* Source: /Users/amirkhabaza/JacHacks2026/littlex/components/ui/tooltip.jac */
import {__jacJsx, __jacSpawn} from "@jac/runtime";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import { cn } from "../../lib/utils.js";
function TooltipProvider(props) {
  let delayDuration = (props["delayDuration"] || 0);
  return __jacJsx(TooltipPrimitive.Provider, Object.assign({}, props, {"data-slot": "tooltip-provider"}, {"delayDuration": delayDuration}), []);
}
function Tooltip(props) {
  return __jacJsx(TooltipPrimitive.Root, Object.assign({}, {"data-slot": "tooltip"}, props), []);
}
function TooltipTrigger(props) {
  return __jacJsx(TooltipPrimitive.Trigger, Object.assign({}, {"data-slot": "tooltip-trigger"}, props), []);
}
function TooltipContent(props) {
  let sideOffset = (props["sideOffset"] || 0);
  return __jacJsx(TooltipPrimitive.Portal, {}, [__jacJsx(TooltipPrimitive.Content, Object.assign({}, props, {"data-slot": "tooltip-content"}, {"sideOffset": sideOffset}, {"className": cn("data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 rounded-md px-3 py-1.5 text-xs bg-foreground text-background z-50 w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin)", props["className"])}), [props["children"], __jacJsx(TooltipPrimitive.Arrow, {"className": "size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground z-50 translate-y-[calc(-50%_-_2px)]"}, [])])]);
}
/*jac:refresh-boundary*/;
export {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger};
//# sourceMappingURL=tooltip.js.map
