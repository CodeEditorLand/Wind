#!/usr/bin/env sh

# Stage 1: Build configuration files - use self-contained ESBuild.ts to avoid circular dependency
Build "Source/Configuration/**/*.{ts,json}" \
	--ESBuild Source/ESBuild.ts

# Stage 1b: Run codegen against VS Code's TypeScript source tree before
# the production build. The codegen emits typed schemas under
# `Source/Effect/Generated/<Decorator>/<Decorator>Upstream.ts` plus a
# top-level `Source/Effect/Generated/ServiceCatalog.ts`. Bridge shapes
# (`Workbench<X>BridgeShape.ts`) `import type` from these so a VS Code
# API change surfaces as a TypeScript build error, not a silent hole.
#
# Codegen is async-iterator-driven; the parser is dependency-free
# (regex + brace-balancing) so it adds no install footprint. The
# script exits non-zero on any `CodegenProblem` so the build halts
# loudly instead of producing a stale Generated/ tree.
if [ -f "Configuration/Codegen/Codegen.js" ]; then
	node Configuration/Codegen/Codegen.js
fi

# Stage 2: Build production to Target/ using compiled Target.js
Build "Source/**/*.ts" \
	--ESBuild Configuration/ESBuild/Target.js
