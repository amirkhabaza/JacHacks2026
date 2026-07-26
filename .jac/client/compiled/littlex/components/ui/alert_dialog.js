/* Source: /Users/amirkhabaza/JacHacks2026/littlex/components/ui/alert_dialog.jac */
import {__jacJsx, __jacSpawn} from "@jac/runtime";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { cn } from "../../lib/utils.js";
import { Button } from "./button.js";
function AlertDialog(props) {
  return __jacJsx(AlertDialogPrimitive.Root, Object.assign({}, {"data-slot": "alert-dialog"}, props), []);
}
function AlertDialogTrigger(props) {
  return __jacJsx(AlertDialogPrimitive.Trigger, Object.assign({}, {"data-slot": "alert-dialog-trigger"}, props), []);
}
function AlertDialogPortal(props) {
  return __jacJsx(AlertDialogPrimitive.Portal, Object.assign({}, {"data-slot": "alert-dialog-portal"}, props), []);
}
function AlertDialogOverlay(props) {
  return __jacJsx(AlertDialogPrimitive.Overlay, Object.assign({}, props, {"data-slot": "alert-dialog-overlay"}, {"className": cn("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 isolate z-50", props["className"])}), []);
}
function AlertDialogContent(props) {
  let size = (props["size"] || "default");
  return __jacJsx(AlertDialogPortal, {}, [__jacJsx(AlertDialogOverlay, {}, []), __jacJsx(AlertDialogPrimitive.Content, Object.assign({}, props, {"data-slot": "alert-dialog-content"}, {"data-size": size}, {"className": cn("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 bg-background ring-foreground/10 gap-4 rounded-xl p-4 ring-1 duration-100 data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 bg-background ring-foreground/10 gap-4 rounded-xl p-4 ring-1 duration-100 data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 outline-none", props["className"])}), [])]);
}
function AlertDialogHeader(props) {
  let attrs = {...props};
  return __jacJsx("div", Object.assign({}, attrs, {"data-slot": "alert-dialog-header"}, {"className": cn("grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr] grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]", props["className"])}), []);
}
function AlertDialogFooter(props) {
  let attrs = {...props};
  return __jacJsx("div", Object.assign({}, attrs, {"data-slot": "alert-dialog-footer"}, {"className": cn("bg-muted/50 -mx-4 -mb-4 rounded-b-xl border-t p-4 bg-muted/50 -mx-4 -mb-4 rounded-b-xl border-t p-4 flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end", props["className"])}), []);
}
function AlertDialogMedia(props) {
  let attrs = {...props};
  return __jacJsx("div", Object.assign({}, attrs, {"data-slot": "alert-dialog-media"}, {"className": cn("bg-muted mb-2 inline-flex size-10 items-center justify-center rounded-md sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-6 bg-muted mb-2 inline-flex size-10 items-center justify-center rounded-md sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-6", props["className"])}), []);
}
function AlertDialogTitle(props) {
  return __jacJsx(AlertDialogPrimitive.Title, Object.assign({}, props, {"data-slot": "alert-dialog-title"}, {"className": cn("text-base font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2 text-base font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2", props["className"])}), []);
}
function AlertDialogDescription(props) {
  return __jacJsx(AlertDialogPrimitive.Description, Object.assign({}, props, {"data-slot": "alert-dialog-description"}, {"className": cn("text-muted-foreground *:[a]:hover:text-foreground text-sm text-balance md:text-pretty *:[a]:underline *:[a]:underline-offset-3 text-muted-foreground *:[a]:hover:text-foreground text-sm text-balance md:text-pretty *:[a]:underline *:[a]:underline-offset-3", props["className"])}), []);
}
function AlertDialogAction(props) {
  let variant = (props["variant"] || "default");
  let size = (props["size"] || "default");
  return __jacJsx(Button, {"variant": variant, "size": size, "asChild": true}, [__jacJsx(AlertDialogPrimitive.Action, Object.assign({}, props, {"data-slot": "alert-dialog-action"}, {"className": cn("grid gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4-dialog-action", props["className"])}), [])]);
}
function AlertDialogCancel(props) {
  let variant = (props["variant"] || "outline");
  let size = (props["size"] || "default");
  return __jacJsx(Button, {"variant": variant, "size": size, "asChild": true}, [__jacJsx(AlertDialogPrimitive.Cancel, Object.assign({}, props, {"data-slot": "alert-dialog-cancel"}, {"className": cn("grid gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4-dialog-cancel", props["className"])}), [])]);
}
/*jac:refresh-boundary*/;
export {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger};
//# sourceMappingURL=alert_dialog.js.map
