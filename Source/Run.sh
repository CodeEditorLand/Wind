#!/usr/bin/env bash

Build "Source/Configuration/**/*.{ts,json}" \
	--ESBuild Source/Configuration/ESBuild/Wind.ts

Build Build 'Source/**/*.ts' \
	--ESBuild Configuration/ESBuild/Target.js \
	--Watch
