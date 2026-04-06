#!/usr/bin/env sh

Build "Source/Configuration/**/*.{ts,json}" \
	--ESBuild Source/Configuration/ESBuild/Wind.ts

Build "Source/**/*.ts" \
	--ESBuild Configuration/ESBuild/Target.js \
	--Watch
