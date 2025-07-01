/**
 * @module Service (Application/Document)
 * @description Defines the service for managing the state of all open text documents.
 * It acts as the extension host's source of truth for document content and lifecycle events.
 */
import { Effect, Option } from "effect";
import type { Disposable, Event, TextDocument, TextDocumentChangeEvent, TextDocumentContentProvider, Uri } from "vscode";
import { Disposable as VSCodeDisposable } from "../../Platform/VSCode/Type.js";
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
    readonly GetDocument: (Uri: Uri) => Effect.Effect<Option.Option<TextDocument>>;
    readonly RegisterTextDocumentContentProvider: (Scheme: string, Provider: TextDocumentContentProvider) => Effect.Effect<Disposable, ContentProviderProblem>;
}
declare const DocumentService_base: Effect.Service.Class<Document, "Service/Document", {
    readonly effect: Effect.Effect<{
        TextDocuments: Effect.Effect<any[], never, never>;
        OnDidOpenTextDocument: any;
        OnDidCloseTextDocument: any;
        OnDidChangeTextDocument: any;
        OnDidSaveTextDocument: any;
        GetDocument: (Uri: Uri) => Effect.Effect<Option.Option<any>, never, never>;
        RegisterTextDocumentContentProvider: (Scheme: string, Provider: TextDocumentContentProvider) => Effect.Effect<VSCodeDisposable, ContentProviderProblem, never>;
    }, never, any>;
}>;
/**
 * The `Effect.Service` for managing text documents.
 */
export declare class DocumentService extends DocumentService_base {
}
export {};
