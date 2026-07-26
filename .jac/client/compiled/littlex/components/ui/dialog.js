/* Source: /Users/amirkhabaza/JacHacks2026/littlex/components/ui/dialog.jac */
import {__jacJsx, __jacSpawn} from "@jac/runtime";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "../../lib/utils.js";
import { buttonVariants } from "./button.js";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
function Dialog(props) {
  return __jacJsx(DialogPrimitive.Root, Object.assign({}, {"data-slot": "dialog"}, props), []);
}
function DialogTrigger(props) {
  return __jacJsx(DialogPrimitive.Trigger, Object.assign({}, {"data-slot": "dialog-trigger"}, props), []);
}
function DialogPortal(props) {
  return __jacJsx(DialogPrimitive.Portal, Object.assign({}, {"data-slot": "dialog-portal"}, props), []);
}
function DialogClose(props) {
  return __jacJsx(DialogPrimitive.Close, Object.assign({}, {"data-slot": "dialog-close"}, props), []);
}
function DialogOverlay(props) {
  return __jacJsx(DialogPrimitive.Overlay, Object.assign({}, props, {"data-slot": "dialog-overlay"}, {"className": cn("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 isolate z-50", props["className"])}), []);
}
function DialogContent(props) {
  let showCloseButton = (props["showCloseButton"] !== false);
  return __jacJsx(DialogPortal, {}, [__jacJsx(DialogOverlay, {}, []), __jacJsx(DialogPrimitive.Content, Object.assign({}, props, {"data-slot": "dialog-content"}, {"className": cn("bg-background data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 ring-foreground/10 grid max-w-[calc(100%-2rem)] gap-4 rounded-xl p-4 text-sm ring-1 duration-100 sm:max-w-sm data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 bg-background ring-foreground/10 grid max-w-[calc(100%-2rem)] gap-4 rounded-xl p-4 text-sm ring-1 duration-100 sm:max-w-sm fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 outline-none", props["className"])}), [props["children"], (showCloseButton && __jacJsx(DialogPrimitive.Close, {"data-slot": "dialog-close", "asChild": true}, [__jacJsx("button", {"className": cn(buttonVariants().call(null, {"variant": "ghost", "size": "icon-sm"}), "absolute top-2 right-2")}, [__jacJsx(HugeiconsIcon, {"icon": Cancel01Icon, "strokeWidth": 2}, []), __jacJsx("span", {"className": "sr-only"}, ["Close"])])]))])]);
}
function DialogHeader(props) {
  let attrs = {...props};
  return __jacJsx("div", Object.assign({}, attrs, {"data-slot": "dialog-header"}, {"className": cn("gap-2 flex flex-col gap-2", props["className"])}), []);
}
function DialogFooter(props) {
  let attrs = {...props};
  let showCloseButton = (props["showCloseButton"] || false);
  return __jacJsx("div", Object.assign({}, attrs, {"data-slot": "dialog-footer"}, {"className": cn("bg-muted/50 -mx-4 -mb-4 rounded-b-xl border-t p-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", props["className"])}), [props["children"], (showCloseButton && __jacJsx(DialogPrimitive.Close, {"asChild": true}, [__jacJsx("button", {"className": cn(buttonVariants().call(null, {"variant": "outline"}))}, ["Close"])]))]);
}
function DialogTitle(props) {
  return __jacJsx(DialogPrimitive.Title, Object.assign({}, props, {"data-slot": "dialog-title"}, {"className": cn("text-base leading-none font-medium text-base leading-none font-medium", props["className"])}), []);
}
function DialogDescription(props) {
  return __jacJsx(DialogPrimitive.Description, Object.assign({}, props, {"data-slot": "dialog-description"}, {"className": cn("text-muted-foreground *:[a]:hover:text-foreground text-sm *:[a]:underline *:[a]:underline-offset-3 text-muted-foreground text-sm", props["className"])}), []);
}
/*jac:refresh-boundary*/;
export {Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger};
//# sourceMappingURL=dialog.js.map
