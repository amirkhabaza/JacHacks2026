/* Source: /Users/amirkhabaza/JacHacks2026/components/WasmShooterSection.jac */
import {__jacJsx, __jacSpawn} from "@jac/runtime";
import { Play, Gamepad2 } from "lucide-react";
import { Button } from "./ui/button.js";
import { run_game } from "../raylib_shim.js";
import { SectionShell } from "./SectionShell.js";
import { useState } from "@jac/runtime";
function WasmShooterSection() {
  const [launched, setLaunched] = useState(false);
  let launch = () => {
    setLaunched(true);
    let canvas = document.getElementById("tij-glcanvas");
    run_game(canvas, (exports, fps) => {
      let score_el = document.getElementById("tij-hud-score");
      let fps_el = document.getElementById("tij-hud-fps");
      if (score_el) {
        score_el.textContent = exports.get_score();
      }
      if (fps_el) {
        fps_el.textContent = fps;
      }
    });
  };
  return __jacJsx(SectionShell, {"id": "wasm", "eyebrow": "WebAssembly", "title": "Oh, you can play it here, because... WASM!", "subtitle": "This tech demo integrates and typechecks across native jac to WebAssembly and the raylib externs via wasm imports, satisfied by a WebGL shim. Click to load the module and play."}, [__jacJsx("div", {"className": "mx-auto max-w-4xl"}, [__jacJsx("div", {"className": "relative overflow-hidden rounded-2xl border border-border bg-[#0b0e16] shadow-2xl shadow-black/40"}, [__jacJsx("div", {"className": "relative mx-auto", "style": {"aspectRatio": "960 / 600", "maxWidth": "960px"}}, [__jacJsx("canvas", {"id": "tij-glcanvas", "width": 960, "height": 600, "className": "h-full w-full", "style": {"display": "block", "cursor": "crosshair"}}, []), __jacJsx("div", {"className": "pointer-events-none absolute left-3 top-3 font-mono text-sm text-[#cdd6e6]", "style": {"textShadow": "0 1px 2px #000"}}, ["score", " ", __jacJsx("b", {"id": "tij-hud-score", "className": "text-primary"}, ["0"]), " \u00b7 ", __jacJsx("b", {"id": "tij-hud-fps", "className": "text-primary"}, ["0"]), " ", "fps"]), (() => {
    let __jac_view_kids = [];
    if (!launched) {
      __jac_view_kids.push(__jacJsx("div", {"className": "absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0b0e16]/90 backdrop-blur-sm"}, [__jacJsx("div", {"className": "flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-primary"}, [__jacJsx(Gamepad2, {"size": 30}, [])]), __jacJsx("div", {"className": "text-center"}, [__jacJsx("div", {"className": "font-display text-lg font-bold text-foreground"}, ["Jac Cube Shooter"]), __jacJsx("div", {"className": "text-sm text-muted-foreground"}, ["WebAssembly + WebGL, compiled from Jac"])]), __jacJsx(Button, {"className": "rounded-full px-6 font-semibold", "onClick": launch}, [__jacJsx(Play, {"size": 16}, []), "Launch demo"])]));
    }
    return __jacJsx(null, {}, [__jac_view_kids]);
  })()])]), __jacJsx("p", {"className": "mt-4 text-center text-sm text-muted-foreground"}, ["Click the canvas to capture the mouse", " \u00b7 ", __jacJsx("b", {"className": "text-foreground"}, ["WASD"]), " ", "move", " \u00b7 ", "mouse / arrows aim", " \u00b7 ", __jacJsx("b", {"className": "text-foreground"}, ["Space"]), " ", "fire", " \u00b7 ", __jacJsx("b", {"className": "text-foreground"}, ["Tab"]), " ", "release"])])]);
}
/*jac:refresh-boundary*/;
export {WasmShooterSection};
//# sourceMappingURL=WasmShooterSection.js.map
