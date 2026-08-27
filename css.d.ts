/**
 * Global stylesheet imports.
 *
 * Next ships ambient declarations for `*.module.css` and the sass variants,
 * but not for plain `.css`. TypeScript 6 raises TS2882 on a side-effect import
 * that resolves to neither a module nor a declaration, which breaks the
 * `import "@/styles/globals.css"` in app/layout.tsx. The bundler handles the
 * stylesheet itself, so there is no shape to describe here.
 *
 * `*.module.css` is the more specific pattern, so Next's typed declaration
 * still wins for CSS modules.
 */
declare module "*.css";
