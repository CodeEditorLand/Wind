2|
3|import type { TextModelResolverService } from "../Interface/TextModelResolverService.js";
4|
5|const StubModel = {
6|	uri: "",
7|
8|	content: "",
9|
10|	version: 1,
11|
12|	languageId: "plaintext",
13|} as const;
14|
15|export const StubTextModelResolverService: TextModelResolverService = {
16|	Resolve: (uri) =>
17|		Effect.succeed({
18|			model: { ...StubModel, uri },
19|			dispose: () => {
20|				// no-op stub
21|			},
22|		}),
23|
24|	HasModel: (_uri) => Effect.succeed(false),
25|
26|	Reload: (uri) => Effect.succeed({ ...StubModel, uri }),
27|};
28|
29|export default StubTextModelResolverService;
30|
