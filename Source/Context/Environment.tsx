import type { Type } from "@Library/Environment";

import type { JSX } from "solid-js";

import Environment, { _Function } from "@Context/Environment/Context";

export default ({ children, Data }: { children?: JSX.Element; Data: Type }) =>
	Environment.Data[1](Data) && (
		<_Function.Provider value={_Function.defaultValue}>
			{children}
		</_Function.Provider>
	);
