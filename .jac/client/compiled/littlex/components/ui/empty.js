/* Source: /Users/amirkhabaza/JacHacks2026/littlex/components/ui/empty.jac */
import {__jacJsx, __jacSpawn} from "@jac/runtime";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils.js";
let _emptyMediaVariants = cva("mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0", {"variants": {"variant": {"default": "bg-transparent", "icon": "bg-muted text-foreground flex size-8 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-4"}}, "defaultVariants": {"variant": "default"}});
function Empty(props) {
  let attrs = {...props};
  return __jacJsx("div", Object.assign({}, {"data-slot": "empty"}, {"className": cn("gap-4 rounded-xl border-dashed p-6 flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center text-balance", props["className"])}, attrs), [props["children"]]);
}
function EmptyHeader(props) {
  let attrs = {...props};
  return __jacJsx("div", Object.assign({}, {"data-slot": "empty-header"}, {"className": cn("gap-2 flex max-w-sm flex-col items-center", props["className"])}, attrs), [props["children"]]);
}
function EmptyMedia(props) {
  let attrs = {...props};
  let variant = (props["variant"] || "default");
  let computedClass = cn(_emptyMediaVariants.call(null, {"variant": variant, "className": props["className"]}));
  return __jacJsx("div", Object.assign({}, {"data-slot": "empty-icon"}, {"data-variant": variant}, {"className": computedClass}, attrs), [props["children"]]);
}
function EmptyTitle(props) {
  let attrs = {...props};
  return __jacJsx("div", Object.assign({}, {"data-slot": "empty-title"}, {"className": cn("text-sm font-medium tracking-tight", props["className"])}, attrs), [props["children"]]);
}
function EmptyDescription(props) {
  let attrs = {...props};
  return __jacJsx("div", Object.assign({}, {"data-slot": "empty-description"}, {"className": cn("text-sm/relaxed text-muted-foreground [&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4", props["className"])}, attrs), [props["children"]]);
}
function EmptyContent(props) {
  let attrs = {...props};
  return __jacJsx("div", Object.assign({}, {"data-slot": "empty-content"}, {"className": cn("gap-2.5 text-sm flex w-full max-w-sm min-w-0 flex-col items-center text-balance", props["className"])}, attrs), [props["children"]]);
}
/*jac:refresh-boundary*/;
export {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle};
//# sourceMappingURL=empty.js.map
