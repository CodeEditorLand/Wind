/**
 * Thin re-export. The real implementation lives at
 * `@codeeditorland/output/Polyfill/ProcessPolyfill` and is the single source
 * of truth - fix polyfill bugs there. This file exists only so legacy
 * imports of `@codeeditorland/wind/Target/Polyfills/ProcessPolyfill`
 * continue to resolve during the transition. The module is a side-effect
 * install when first imported (see Output source); no named exports are
 * re-exported because the polyfill's effect is what callers depend on.
 */
import "@codeeditorland/output/Polyfill/ProcessPolyfill";

export default {};
