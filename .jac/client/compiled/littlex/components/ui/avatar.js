/* Source: /Users/amirkhabaza/JacHacks2026/littlex/components/ui/avatar.jac */
import {__jacJsx, __jacSpawn} from "@jac/runtime";
import { Avatar as AvatarPrimitive } from "radix-ui";
import { cn } from "../../lib/utils.js";
function Avatar(props) {
  let size = (props["size"] || "default");
  return __jacJsx(AvatarPrimitive.Root, Object.assign({}, props, {"data-slot": "avatar"}, {"data-size": size}, {"className": cn("size-8 rounded-full after:rounded-full data-[size=lg]:size-10 data-[size=sm]:size-6 after:border-border group/avatar relative flex shrink-0 select-none after:absolute after:inset-0 after:border after:mix-blend-darken dark:after:mix-blend-lighten", props["className"])}), []);
}
function AvatarImage(props) {
  return __jacJsx(AvatarPrimitive.Image, Object.assign({}, props, {"data-slot": "avatar-image"}, {"className": cn("rounded-full aspect-square size-full object-cover", props["className"])}), []);
}
function AvatarFallback(props) {
  return __jacJsx(AvatarPrimitive.Fallback, Object.assign({}, props, {"data-slot": "avatar-fallback"}, {"className": cn("bg-muted text-muted-foreground rounded-full flex size-full items-center justify-center text-sm group-data-[size=sm]/avatar:text-xs", props["className"])}), []);
}
function AvatarBadge(props) {
  let attrs = {...props};
  return __jacJsx("span", Object.assign({}, attrs, {"data-slot": "avatar-badge"}, {"className": cn("bg-primary text-primary-foreground ring-background absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-blend-color ring-2 select-none", "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden", "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2", "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2", props["className"])}), []);
}
function AvatarGroup(props) {
  let attrs = {...props};
  return __jacJsx("div", Object.assign({}, attrs, {"data-slot": "avatar-group"}, {"className": cn("size-8 rounded-full after:rounded-full data-[size=lg]:size-10 data-[size=sm]:size-6-group *:data-[slot=avatar]:ring-background group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2", props["className"])}), []);
}
function AvatarGroupCount(props) {
  let attrs = {...props};
  return __jacJsx("div", Object.assign({}, attrs, {"data-slot": "avatar-group-count"}, {"className": cn("bg-muted text-muted-foreground size-8 rounded-full text-sm group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3 ring-background relative flex shrink-0 items-center justify-center ring-2", props["className"])}), []);
}
/*jac:refresh-boundary*/;
export {Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage};
//# sourceMappingURL=avatar.js.map
