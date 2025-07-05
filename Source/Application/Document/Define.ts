/**
 * @module Define
 * @description
 * Defines the service for managing the state of all open text documents.
 * It acts as the extension host's source of truth for document content and
 * lifecycle events, communicating with the main thread to keep state synchronized.
 */

import type { IModelChangedEvent } from "@codeeditorland/output/vs/editor/common/model/mirrorTextModel.js";
import type { MainThreadDocumentsShape } from "@codeeditorland/output/vs/workbench/api/common/extHost.protocol.js";
import { ExtHostDocumentData } from "@codeeditorland/output/vs/workbench/api/common/extHostDocumentData.js";
import { Effect, HashMap, Option, Ref } from "effect";
import type {
	Event,
	ProviderResult,
	TextDocument,
	TextDocumentChangeEvent,
	TextDocumentContentProvider,
} from "vscode";

import {
	CancellationTokenSource,
	Disposable as VSCodeDisposable,
	type IDisposable,
	type Uri,
} from "../../Platform/Vscode/Type.js";
import { ToAPI as RangeToAPI } from "../../TypeConverter/Main/Range.js";
import { ToAPI as UriToAPI } from "../../TypeConverter/Main/Uri.js";
import { CreateEmitter } from "../../Utility/EventStream.js";
import { IPCService } from "../IPC/Define.js";
import { LoggerService } from "../Logger/Define.js";
import { ContentProviderProblem } from "./Problem.js";

/**
 * The contract for the Document service. It manages all open text documents,
 * their content, and lifecycle events.
 */
export interface Interface {
	readonly GetDocuments: Effect.Effect<readonly TextDocument[]>;
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
	) => Effect.Effect<IDisposable, ContentProviderProblem>;
}

/**
 * The `Effect.Service` for managing text documents. It synchronizes document
 * state with the main thread and provides an API for extensions to interact
 * with documents and register content providers for virtual documents.
 */
export class DocumentService extends Effect.Service<Interface>()(
	"Service/Document",
	{
		effect: Effect.gen(function* (Generator) {
			const IPC = yield* Generator(IPCService);
			const Logger = yield* Generator(LoggerService);

			const DocumentMap = yield* Generator(
				Ref.make(HashMap.empty<string, ExtHostDocumentData>()),
			);
			const ContentProviders = yield* Generator(
				Ref.make(HashMap.empty<string, TextDocumentContentProvider>()),
			);
			const MainThreadProxy = IPC.CreateProxy<MainThreadDocumentsShape>(
				"$rpc:mainThreadDocuments",
			);

			const { event: OnDidOpenTextDocument, fire: FireOpen } =
				yield* Generator(CreateEmitter<TextDocument>());
			const { event: OnDidCloseTextDocument, fire: FireClose } =
				yield* Generator(CreateEmitter<TextDocument>());
			const { event: OnDidChangeTextDocument, fire: FireChange } =
				yield* Generator(CreateEmitter<TextDocumentChangeEvent>());
			const { event: OnDidSaveTextDocument, fire: FireSave } =
				yield* Generator(CreateEmitter<TextDocument>());

			const AcceptModelAdded = (Data: any) =>
				Effect.gen(function* (Generator) {
					const RevivedUri = UriToAPI(Data.uri);
					const DocumentData = new ExtHostDocumentData(
						MainThreadProxy,
						RevivedUri,
						Data.lines,
						Data.eol,
						Data.versionId,
						Data.languageId,
						Data.isDirty,
					);
					yield* Generator(
						Ref.update(DocumentMap, (Map) =>
							HashMap.set(
								Map,
								DocumentData.document.uri.toString(),
								DocumentData,
							),
						),
					);
					FireOpen(DocumentData.document);
				});

			const AcceptModelRemoved = (UriDTO: any) =>
				Effect.gen(function* (Generator) {
					const UriString = UriToAPI(UriDTO).toString();
					const DocumentData = yield* Generator(
						Ref.get(DocumentMap).pipe(
							Effect.map(HashMap.get(UriString)),
						),
					);
					if (Option.isSome(DocumentData)) {
						yield* Generator(
							Ref.update(DocumentMap, (Map) =>
								HashMap.remove(Map, UriString),
							),
						);
						FireClose(DocumentData.value.document);
					}
				});

			const AcceptModelChanged = (UriDTO: any, ChangeEventDTO: any) =>
				Effect.gen(function* (Generator) {
					const UriString = UriToAPI(UriDTO).toString();
					const DocumentData = yield* Generator(
						Ref.get(DocumentMap).pipe(
							Effect.map(HashMap.get(UriString)),
						),
					);
					if (Option.isSome(DocumentData)) {
						const ModelChangedEvent: IModelChangedEvent = {
							changes: ChangeEventDTO.changes,
							eol: ChangeEventDTO.eol,
							versionId: ChangeEventDTO.versionId,
							isUndoing: false, // These flags are not propagated
							isRedoing: false,
						};
						DocumentData.value.onEvents(ModelChangedEvent);
						FireChange({
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
				Effect.gen(function* (Generator) {
					const URI = UriToAPI(UriComponents);
					const MaybeProvider = yield* Generator(
						Ref.get(ContentProviders).pipe(
							Effect.map(HashMap.get(URI.scheme)),
						),
					);
					if (
						Option.isNone(MaybeProvider) ||
						!MaybeProvider.value.provideTextDocumentContent
					) {
						return Option.none<string>();
					}
					const Token = new CancellationTokenSource().token;
					const Content = yield* Generator(
						Effect.promise(() =>
							Promise.resolve(
								MaybeProvider.value.provideTextDocumentContent(
									URI,
									Token,
								) as ProviderResult<string>,
							),
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

			// Register handlers for incoming RPC calls from the main thread.
			IPC.RegisterInvokeHandler("$acceptModelAdded", ([Data]: [any]) =>
				Effect.runPromise(AcceptModelAdded(Data)),
			);
			IPC.RegisterInvokeHandler("$acceptModelRemoved", ([URI]: [any]) =>
				Effect.runPromise(AcceptModelRemoved(URI)),
			);
			IPC.RegisterInvokeHandler(
				"$acceptModelChanged",
				([URI, Changes]: [any, any]) =>
					Effect.runPromise(AcceptModelChanged(URI, Changes)),
			);
			IPC.RegisterInvokeHandler(
				"$provideTextDocumentContent",
				([UriComponents]: [any]) =>
					Effect.runPromise(
						ProvideTextDocumentContent(UriComponents),
					),
			);

			return {
				GetDocuments: Ref.get(DocumentMap).pipe(
					Effect.map((Map) =>
						Array.from(HashMap.values(Map)).map(
							(Data) => Data.document,
						),
					),
				),
				OnDidOpenTextDocument,
				OnDidCloseTextDocument,
				OnDidChangeTextDocument,
				OnDidSaveTextDocument,
				GetDocument: (URI: Uri) =>
					Ref.get(DocumentMap).pipe(
						Effect.map((Map) => HashMap.get(Map, URI.toString())),
						Effect.map(Option.map((Data) => Data.document)),
					),
				RegisterTextDocumentContentProvider: (
					Scheme: string,
					Provider: TextDocumentContentProvider,
				) =>
					Effect.gen(function* (Generator) {
						yield* Generator(
							IPC.SendNotification(
								"$registerTextDocumentContentProvider",
								[Scheme],
							),
						);
						yield* Generator(
							Ref.update(ContentProviders, (Map) =>
								HashMap.set(Map, Scheme, Provider),
							),
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
