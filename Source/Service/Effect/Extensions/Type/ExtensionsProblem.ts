2|
3|export type ExtensionsProblem =
4|	| { readonly _tag: "ExtensionsNotAvailable"; readonly reason: string }

5|	| { readonly _tag: "ExtensionsOperationFailed"; readonly error: Error }

6|	| {

7|			readonly _tag: "ExtensionsInvalidArgument";

8|
9|			readonly argument: string;

10|
11|			readonly reason: string;

12|	  };

13|
