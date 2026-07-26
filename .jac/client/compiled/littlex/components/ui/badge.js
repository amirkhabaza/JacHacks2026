/* Source: /Users/amirkhabaza/JacHacks2026/littlex/components/ui/badge.jac */
import {__jacJsx, __jacSpawn} from "@jac/runtime";
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "../../lib/utils.js";
let _badgeVariants = cva("h-5 gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! h-5 gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive overflow-hidden group/badge", {"variants": {"variant": {"default": "bg-primary text-primary-foreground [a]:hover:bg-primary/80 bg-primary text-primary-foreground [a]:hover:bg-primary/80", "secondary": "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80 bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80", "destructive": "bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20 bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20", "outline": "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground", "ghost": "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50 hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50", "link": "text-primary underline-offset-4 hover:underline text-primary underline-offset-4 hover:underline"}}, "defaultVariants": {"variant": "default"}});
function Badge(props) {
  let attrs = {...props};
  let variant = (props["variant"] || "default");
  let asChild = (props["asChild"] || false);
  let variantsFn = _badgeVariants;
  let computedClass = cn(variantsFn.call(null, {"variant": variant}), props["className"]);
  if (asChild) {
    return __jacJsx(Slot.Root, Object.assign({}, props, {"data-slot": "badge"}, {"data-variant": variant}, {"className": computedClass}), []);
  }
  return __jacJsx("span", Object.assign({}, attrs, {"data-slot": "badge"}, {"data-variant": variant}, {"className": computedClass}), []);
}
function badgeVariants() {
  return _badgeVariants;
}
export {Badge, badgeVariants};
//# sourceMappingURL=badge.js.map
