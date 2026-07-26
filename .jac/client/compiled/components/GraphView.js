/* Source: /Users/amirkhabaza/JacHacks2026/components/GraphView.jac */
import {__jacJsx, __jacSpawn} from "@jac/runtime";
import { Waypoints, ArrowUpRight } from "lucide-react";
function GraphView(props) {
  const {refreshKey: refreshKey = 0} = props;
  return __jacJsx("div", {"className": "overflow-hidden rounded-xl border border-border bg-card shadow-lg shadow-black/20"}, [__jacJsx("div", {"className": "flex items-center gap-1.5 border-b border-border/70 bg-white/[0.02] px-3 py-2 font-mono text-xs text-muted-foreground"}, [__jacJsx(Waypoints, {"size": 13, "className": "text-primary"}, []), "/graph - live Jac graph visualizer", __jacJsx("a", {"href": "/graph", "target": "_blank", "rel": "noreferrer", "className": "ml-auto flex items-center gap-1 rounded-md px-2 py-0.5 transition hover:bg-white/5 hover:text-foreground"}, ["open", __jacJsx(ArrowUpRight, {"size": 13}, [])])]), __jacJsx("iframe", {"src": ("/graph?public=1&v=" + String(refreshKey)), "title": "Jac Graph Visualizer", "className": "h-[440px] w-full border-0 bg-background"}, []), __jacJsx("p", {"className": "border-t border-border/70 px-3 py-2 text-[0.7rem] leading-snug text-muted-foreground"}, ["This is the ", __jacJsx("span", {"className": "text-foreground"}, ["public graph"]), " - the Day and Visitor nodes the guestbook above writes, each signature grouped under the day it was signed. Logged into littleX? Hit \"open\" to see your own user graph in a full tab."])]);
}
/*jac:refresh-boundary*/;
export {GraphView};
//# sourceMappingURL=GraphView.js.map
