/*
 * File: Wind/Source/Application/Instantiation/Register.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:35 UTC
 * Dependency: effect
 * Export: LayerMap
 */

import { Layer } from "effect";

export const LayerMap = new Map<any, Layer.Layer<any, any, any>>();

const RegisterService = (
	Constructor: any,
	Layer: Layer.Layer<any, any, any>,
): void => {
	LayerMap.set(Constructor, Layer);
};

export default RegisterService;
