/* Source: /Users/amirkhabaza/JacHacks2026/components/HeroSection.jac */
import {__jacJsx, __jacSpawn} from "@jac/runtime";
import { ArrowDown, Terminal } from "lucide-react";
import { Button } from "./ui/button.js";
function HeroSection() {
  return __jacJsx("section", {"id": "top", "className": "relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16"}, [__jacJsx("div", {"className": "tij-grid absolute inset-0 -z-10"}, []), __jacJsx("div", {"className": "tij-glow absolute inset-x-0 top-0 -z-10 h-[600px]"}, []), __jacJsx("div", {"className": "tij-fade-up flex w-full max-w-5xl flex-col items-center text-center"}, [__jacJsx("div", {"className": "mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur"}, [__jacJsx("span", {"className": "size-2 rounded-full bg-primary tij-pulse"}, []), "This is a technology demonstration."]), __jacJsx("h1", {"className": "font-display text-6xl font-bold leading-[0.95] tracking-tight text-foreground md:text-8xl"}, ["This is", " ", __jacJsx("span", {"className": "tij-gradient-text"}, ["Jac"]), "."]), __jacJsx("p", {"className": "mt-6 max-w-2xl text-balance text-xl text-muted-foreground"}, ["\"This language shouldn't be possible.\""]), __jacJsx("div", {"className": "mt-8 flex flex-wrap items-center justify-center gap-3"}, [__jacJsx("a", {"href": "#fullstack"}, [__jacJsx(Button, {"size": "lg", "className": "rounded-full px-7 font-semibold"}, ["Keep going", __jacJsx(ArrowDown, {"size": 18}, [])])])])]), __jacJsx("a", {"href": "#fullstack", "className": "tij-bounce absolute bottom-8 text-muted-foreground", "aria-label": "Scroll down"}, [__jacJsx(ArrowDown, {"size": 24}, [])])]);
}
/*jac:refresh-boundary*/;
export {HeroSection};
//# sourceMappingURL=HeroSection.js.map
