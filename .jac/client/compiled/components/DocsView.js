/* Source: /Users/amirkhabaza/JacHacks2026/components/DocsView.jac */
import {__jacJsx, __jacSpawn} from "@jac/runtime";
import { FileText, ArrowUpRight } from "lucide-react";
function DocsView() {
  return __jacJsx("div", {"className": "flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg shadow-black/20"}, [__jacJsx("div", {"className": "flex items-center gap-1.5 border-b border-border/70 bg-white/[0.02] px-3 py-2 font-mono text-xs text-muted-foreground"}, [__jacJsx(FileText, {"size": 13, "className": "text-primary"}, []), "/docs - FastAPI Swagger UI", __jacJsx("a", {"href": "/docs", "target": "_blank", "rel": "noreferrer", "className": "ml-auto flex items-center gap-1 rounded-md px-2 py-0.5 transition hover:bg-white/5 hover:text-foreground"}, ["open", __jacJsx(ArrowUpRight, {"size": 13}, [])])]), __jacJsx("iframe", {"src": "/docs", "title": "API docs (Swagger UI)", "className": "w-full flex-1 min-h-[420px] border-0 bg-white"}, [])]);
}
/*jac:refresh-boundary*/;
export {DocsView};
//# sourceMappingURL=DocsView.js.map
