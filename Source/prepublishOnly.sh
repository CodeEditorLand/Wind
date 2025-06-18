# File: Wind/Source/prepublishOnly.sh
# Responsibility:
# Modified: 2025-06-01 22:28:54 UTC

#!/usr/bin/env bash

Build "Source/Configuration/**/*.{ts,json}" \
	--ESBuild Source/Configuration/ESBuild/Wind.ts

Build "Source/**/*.ts" \
	--ESBuild Configuration/ESBuild/Target.js
