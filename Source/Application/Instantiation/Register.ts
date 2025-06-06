import { Layer } from "effect";

export const LayerMap = new Map<any, Layer.Layer<any, any, any>>();

const RegisterService = (
	Constructor: any,
	Layer: Layer.Layer<any, any, any>,
): void => {
	LayerMap.set(Constructor, Layer);
};

export default RegisterService;
