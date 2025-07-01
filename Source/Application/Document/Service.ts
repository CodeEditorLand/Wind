/**
 * @module Service (Application/Document)
 * @description Defines the service for managing the state of all open text documents.
 * It acts as the extension host's source of truth for document content and lifecycle events.
 */

import { Effect, HashMap, Option, Ref } from "effect";
import { Emitter } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/base/common/event.js";
import type { IModelChangedEvent } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/editor/common/model/mirrorTextModel.js";
import type { MainThreadDocumentsShape } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/api/common/extHost.protocol.js";
import { ExtHostDocumentData } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/api/common/extHostDocumentData.js";
import type {
	Disposable,
	Event,
	ProviderResult,
	TextDocument,
	TextDocumentChangeEvent,
	TextDocumentContentProvider,
	Uri,
} from "vscode";

import {
	CancellationTokenSource,
	Disposable as VSCodeDisposable,
} from "../../Platform/VSCode/Type.js";
import { ToAPI as RangeToAPI } from "../../TypeConverter/Main/Range.js";
import { ToAPI as UriToAPI } from "../../TypeConverter/Main/URI.js";
import { IPCService } from "../IPC/Service.js";
import { LoggerService } from "../Logger/Service.js";
import { ContentProviderProblem } from "./Error.js";

/**
 * The contract for the Document service. It manages all open text documents,
 * their content, and lifecycle events.
 */
export interface Document {
	readonly TextDocuments: Effect.Effect<readonly TextDocument[]>;
	readonly OnDidOpenTextDocument: Event<TextDocument>;
	readonly OnDidCloseTextDocument: Event<TextDocument>;
	readonly OnDidChangeTextDocument: Event<TextDocumentChangeEvent>;
	readonly OnDidSaveTextDocument: Event<TextDocument>;
	readonly GetDocument: (
		Uri: Uri,
	) => Effect.Effect<Option.Option<TextDocument>>;
	readonly RegisterTextDocumentContentProvider: (
		Scheme: string,
		Provider: TextDocumentContentProvider,
	) => Effect.Effect<Disposable, ContentProviderProblem>;
}

/**
 * The `Effect.Service` for managing text documents.
 */
export class DocumentService extends Effect.Service<Document>()(
	"Service/Document",
	{
		effect: Effect.gen(function* () {
			const IPC = yield* IPCService;
			const Logger = yield* LoggerService;

			const DocumentMap = yield* Ref.make(
				HashMap.empty<string, ExtHostDocumentData>(),
			);
			const ContentProviders = yield* Ref.make(
				HashMap.empty<string, TextDocumentContentProvider>(),
			);
			const MainThreadProxy = IPC.CreateProxy<MainThreadDocumentsShape>(
				"$rpc:mainThreadDocuments",
			);

			const OnDidOpenTextDocumentEmitter = new Emitter<TextDocument>();
			const OnDidCloseTextDocumentEmitter = new Emitter<TextDocument>();
			const OnDidChangeTextDocumentEmitter =
				new Emitter<TextDocumentChangeEvent>();
			const OnDidSaveTextDocumentEmitter = new Emitter<TextDocument>();

			const AcceptModelAdded = (Data: any) =>
				Effect.gen(function* () {
					const RevivedUri = UriToAPI(Data.uri);
					const DocumentData = new ExtHostDocumentData(
						MainThreadProxy,
						RevivedUri,
						Data.lines,
						Data.eol,
						Data.versionId,
						Data.languageId,
						Data.isDirty,
						Data.encoding,
					);
					yield* Ref.update(DocumentMap, (Map) =>
						HashMap.set(
							Map,
							DocumentData.document.uri.toString(),
							DocumentData,
						),
					);
					OnDidOpenTextDocumentEmitter.fire(DocumentData.document);
				});

			const AcceptModelRemoved = (UriDTO: any) =>
				Effect.gen(function* () {
					const UriString = UriToAPI(UriDTO).toString();
					const Map = yield* Ref.get(DocumentMap);
					const DocumentData = HashMap.get(Map, UriString);
					if (Option.isSome(DocumentData)) {
						yield* Ref.update(DocumentMap, (Map) =>
							HashMap.remove(Map, UriString),
						);
						OnDidCloseTextDocumentEmitter.fire(
							DocumentData.value.document,
						);
					}
				});

			const AcceptModelChanged = (UriDTO: any, ChangeEventDTO: any) =>
				Effect.gen(function* () {
					const UriString = UriToAPI(UriDTO).toString();
					const DocumentData = yield* Ref.get(DocumentMap).pipe(
						Effect.map(HashMap.get(UriString)),
					);
					if (Option.isSome(DocumentData)) {
						const ModelChangedEvent: IModelChangedEvent = {
							changes: ChangeEventDTO.changes,
							eol: ChangeEventDTO.eol,
							versionId: ChangeEventDTO.versionId,
							isUndoing: false,
							isRedoing: false,
						};
						DocumentData.value.onEvents(ModelChangedEvent);
						OnDidChangeTextDocumentEmitter.fire({
							document: DocumentData.value.document,
							contentChanges: ChangeEventDTO.changes.map(
								(Change: any) => ({
									range: RangeToAPI(Change.range),
									rangeOffset: Change.rangeOffset,
									rangeLength: Change.rangeLength,
									text: Change.text,
								}),
							),
							reason: ChangeEventDTO.reason,
						});
					}
				});

			const ProvideTextDocumentContent = (UriComponents: any) =>
				Effect.gen(function* () {
					const Uri = UriToAPI(UriComponents);
					const MaybeProvider = yield* Ref.get(ContentProviders).pipe(
						Effect.map(HashMap.get(Uri.scheme)),
					);
					if (
						Option.isNone(MaybeProvider) ||
						!MaybeProvider.value.provideTextDocumentContent
					) {
						return Option.none<string>();
					}
					const Token = new CancellationTokenSource().token;
					const Content = yield* Effect.promise(() =>
						Promise.resolve(
							MaybeProvider.value.provideTextDocumentContent(
								Uri,
								Token,
							) as ProviderResult<string>,
						),
					);
					return Option.fromNullable(Content);
				}).pipe(
					Effect.catchAll((error) =>
						Logger.error(error).pipe(
							Effect.as(Option.none<string>()),
						),
					),
					Effect.map(Option.getOrElse(() => null)),
				);

			IPC.RegisterInvokeHandler("$acceptModelAdded", ([Data]: [any]) =>
				Effect.runPromise(AcceptModelAdded(Data)),
			);
			IPC.RegisterInvokeHandler("$acceptModelRemoved", ([Uri]: [any]) =>
				Effect.runPromise(AcceptModelRemoved(Uri)),
			);
			IPC.RegisterInvokeHandler(
				"$acceptModelChanged",
				([Uri, Changes]: [any, any]) =>
					Effect.runPromise(AcceptModelChanged(Uri, Changes)),
			);
			IPC.RegisterInvokeHandler(
				"$provideTextDocumentContent",
				([UriComponents]: [any]) =>
					Effect.runPromise(
						ProvideTextDocumentContent(UriComponents),
					),
			);

			return {
				TextDocuments: Ref.get(DocumentMap).pipe(
					Effect.map((Map) =>
						Array.from(HashMap.values(Map)).map(
							(Data) => Data.document,
						),
					),
				),
				OnDidOpenTextDocument: OnDidOpenTextDocumentEmitter.event,
				OnDidCloseTextDocument: OnDidCloseTextDocumentEmitter.event,
				OnDidChangeTextDocument: OnDidChangeTextDocumentEmitter.event,
				OnDidSaveTextDocument: OnDidSaveTextDocumentEmitter.event,
				GetDocument: (Uri: Uri) =>
					Ref.get(DocumentMap).pipe(
						Effect.map((Map) => HashMap.get(Map, Uri.toString())),
						Effect.map(Option.map((Data) => Data.document)),
					),
				RegisterTextDocumentContentProvider: (
					Scheme: string,
					Provider: TextDocumentContentProvider,
				) =>
					Effect.gen(function* () {
						yield* IPC.SendNotification(
							"$registerTextDocumentContentProvider",
							[Scheme],
						);
						yield* Ref.update(ContentProviders, (Map) =>
							HashMap.set(Map, Scheme, Provider),
						);
						return new VSCodeDisposable(() => {
							const Unregister = Ref.update(
								ContentProviders,
								(Map) => HashMap.remove(Map, Scheme),
							).pipe(
								Effect.andThen(
									IPC.SendNotification(
										"$unregisterTextDocumentContentProvider",
										[Scheme],
									),
								),
							);
							Effect.runFork(Unregister);
						});
					}).pipe(
						Effect.mapError(
							(Cause) =>
								new ContentProviderProblem({
									Cause,
									Scheme,
									Context: "RegisterProviderFailed",
								}),
						),
					),
			};
		}),
	},
) {}
