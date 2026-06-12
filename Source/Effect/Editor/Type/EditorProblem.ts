2|
3|export type EditorProblem =
4|	| { readonly _tag: "EditorNotAvailable"; readonly reason: string }
5|	| { readonly _tag: "EditorOperationFailed"; readonly error: Error }
6|	| {
7|			readonly _tag: "EditorInvalidArgument";
8|
9|			readonly argument: string;
10|
11|			readonly reason: string;
12|	  };
13|
