#!/usr/bin/env sh

# Stage 1: Build configuration files - use self-contained ESBuild.ts to avoid circular dependency
Build "Source/Configuration/**/*.{ts,json}" \
	--ESBuild Source/ESBuild.ts

# Stage 2: Build production to Target/ using compiled Target.js
Build "Source/**/*.ts" \
	--ESBuild Configuration/ESBuild/Target.js
