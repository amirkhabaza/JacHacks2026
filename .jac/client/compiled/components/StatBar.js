/* Source: /Users/amirkhabaza/JacHacks2026/components/StatBar.jac */
import {__jacJsx, __jacSpawn} from "@jac/runtime";
function StatBar(props) {
  const {label, value, max_value, display, barClass: barClass = "bg-primary", sub: sub = ""} = props;
  let pct = 0.0;
  if ((max_value > 0.0)) {
    pct = Math.min(100.0, ((value / max_value) * 100.0));
  }
  return __jacJsx("div", {"className": "flex flex-col gap-1.5"}, [__jacJsx("div", {"className": "flex items-baseline justify-between"}, [__jacJsx("span", {"className": "text-sm font-medium text-foreground"}, [label]), __jacJsx("span", {"className": "font-mono text-sm tabular-nums text-muted-foreground"}, [display])]), __jacJsx("div", {"className": "h-2.5 w-full overflow-hidden rounded-full bg-muted"}, [__jacJsx("div", {"className": ("h-full rounded-full transition-all duration-700 ease-out " + barClass), "style": {"width": (String(pct) + "%")}}, [])]), (() => {
    let __jac_view_kids = [];
    if (sub) {
      __jac_view_kids.push(__jacJsx("span", {"className": "text-xs text-muted-foreground"}, [sub]));
    }
    return __jacJsx(null, {}, [__jac_view_kids]);
  })()]);
}
/*jac:refresh-boundary*/;
export {StatBar};
//# sourceMappingURL=StatBar.js.map
