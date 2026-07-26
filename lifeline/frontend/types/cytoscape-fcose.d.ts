/** cytoscape-fcose ships no type declarations; this is the surface we use. */
declare module "cytoscape-fcose" {
  import type { Ext } from "cytoscape";
  const extension: Ext;
  export default extension;
}
