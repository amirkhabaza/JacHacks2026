/* Source: /Users/amirkhabaza/JacHacks2026/components/SectionShell.jac */
import {__jacJsx, __jacSpawn} from "@jac/runtime";
function SectionShell(props) {
  const {id, eyebrow, title, subtitle: subtitle = "", children: children = null, className: className = ""} = props;
  return __jacJsx("section", {"id": id, "className": ("relative flex min-h-screen w-full scroll-mt-20 flex-col justify-center px-6 py-24 " + className)}, [__jacJsx("div", {"className": "mx-auto w-full max-w-6xl"}, [__jacJsx("div", {"className": "mx-auto mb-12 max-w-2xl text-center"}, [__jacJsx("div", {"className": "mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs font-medium uppercase tracking-widest text-primary"}, [__jacJsx("span", {"className": "size-1.5 rounded-full bg-primary tij-pulse"}, []), eyebrow]), __jacJsx("h2", {"className": "font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl"}, [title]), (() => {
    let __jac_view_kids = [];
    if (subtitle) {
      __jac_view_kids.push(__jacJsx("p", {"className": "mt-4 text-balance text-lg text-muted-foreground"}, [subtitle]));
    }
    return __jacJsx(null, {}, [__jac_view_kids]);
  })()]), children])]);
}
/*jac:refresh-boundary*/;
export {SectionShell};
//# sourceMappingURL=SectionShell.js.map
