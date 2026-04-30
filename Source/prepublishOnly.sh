#!/usr/bin/env sh
set -e

# Stage 1: Build configuration files - use self-contained ESBuild.ts to
# avoid circular dependency. Compiles every `Source/Configuration/**/*`
# (including the new `ESBuild/Codegen.ts` + `ESBuild/Config/CodegenConfig.ts`)
# down to `Configuration/`, ready for Stage 1b/2 to consume via
# `--ESBuild Configuration/ESBuild/<…>.js`.
Build "Source/Configuration/**/*.{ts,json}" \
	--ESBuild Source/ESBuild.ts

# Stage 1b: Codegen against VS Code's TypeScript source tree.
#
# Two-step using the same `Build` pipeline as Stage 2:
#
#   1. `Build "Source/Codegen/Codegen.ts" --ESBuild Configuration/ESBuild/Codegen.js`
#      bundles the codegen entry + its relative graph into a single
#      Node-runnable ESM file at `Configuration/Codegen/Codegen.js`.
#      `CodegenConfig` (sibling to `TargetConfig` / `CompileConfig`)
#      sets `bundle: true`, `format: esm`, `platform: node`,
#      `target: node22`, and emits with an inline source map for
#      readable stack traces on failure.
#   2. `node` runs the bundle. Codegen walks
#      `Dependency/Microsoft/Dependency/Editor/src/`, emits
#      `Source/Effect/Generated/<…>` (service schemas, service
#      catalog, command catalog) for Stage 2 to compile to
#      `Target/`, and exits non-zero on any `CodegenProblem`.
#
# `set -e` at the top of the script halts the build on a non-zero
# exit so the workspace never publishes a stale Generated/ tree.
Build "Source/Codegen/Codegen.ts" \
	--ESBuild Configuration/ESBuild/Codegen.js
node Configuration/Codegen/Codegen.js

# Stage 2: Build production sources to `Target/`. Picks up the
# freshly-emitted `Source/Effect/Generated/*.ts` files alongside
# the rest of the source tree.
Build "Source/**/*.ts" \
	--ESBuild Configuration/ESBuild/Target.js
