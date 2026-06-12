2|
3|export type CommandsProblem =
4|	| { readonly _tag: "CommandsNotAvailable"; readonly reason: string }

5|	| { readonly _tag: "CommandsOperationFailed"; readonly error: Error }

6|	| {

7|			readonly _tag: "CommandsInvalidArgument";

8|
9|			readonly argument: string;

10|
11|			readonly reason: string;

12|	  };

13|
