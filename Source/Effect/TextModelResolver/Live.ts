1|/**
2| * @module Effect/TextModelResolver/Live
3| * @description
4| * Live implementation of TextModelResolverService. Delegates to the
5| * ModelService for open/close lifecycle and adds a reference-counting
6| * dispose pattern compatible with VS Code's IReference<ITextModel>.
7| *
8| * IPC channels used indirectly via ModelService:
9| *   model:open          → open a document and return TextModel
10| *   model:get           → check if model exists
11| *   model:close         → release on dispose
12| *   model:updateContent → force-reload content from Mountain
13| */
14|
16|
17|import type { TextModel } from "../Model/Interface/ModelService.js";
18|import { ModelServiceInstance } from "../Model/Live.js";
19|import type { TextModelResolverService } from "./Interface/TextModelResolverService.js";
20|
21|function makeTextModelResolverService(): TextModelResolverService {
22|	const ModelService = ModelServiceInstance;
23|
24|	// Simple reference counter: uri → open count
25|	const RefCounts = new Map<string, number>();
26|
27|	// Bridge: ModelService methods still return Effect.Effect until EFX Phase N.
28|	// Use runPromise to convert to plain Promise for this service.
29|	const OpenModel = (uri: string): Promise<TextModel> =>
30|		Effect.runPromise(ModelService.OpenModel(uri));
31|
32|	const GetModel = (uri: string): Promise<TextModel | null> =>
33|		Effect.runPromise(ModelService.GetModel(uri));
34|
35|	const CloseModel = (uri: string): Promise<void> =>
36|		Effect.runPromise(ModelService.CloseModel(uri));
37|
38|	const Service: TextModelResolverService = {
39|		Resolve: async (uri) => {
40|			const Model = await OpenModel(uri);
41|
42|			// Increment reference count
43|			RefCounts.set(uri, (RefCounts.get(uri) ?? 0) + 1);
44|
45|			return {
46|				model: Model,
47|				dispose: () => {
48|					const Count = (RefCounts.get(uri) ?? 1) - 1;
49|
50|					if (Count <= 0) {
51|						RefCounts.delete(uri);
52|
53|						// Fire-and-forget close when ref count drops to zero
54|						void CloseModel(uri).catch(() => {});
55|					} else {
56|						RefCounts.set(uri, Count);
57|					}
58|				},
59|			};
60|		},
61|
62|		HasModel: async (uri) => {
63|			const Result = await GetModel(uri);
64|
65|			return Result !== null;
66|		},
67|
68|		Reload: async (uri) =>
69|			// Re-open (Mountain always reads from disk on open)
70|			OpenModel(uri),
71|	};
72|
73|	return Service;
74|}
75|
76|export const LiveTextModelResolverServiceLayer =
77|	makeTextModelResolverService();
78|
79|export default LiveTextModelResolverServiceLayer;
80|
