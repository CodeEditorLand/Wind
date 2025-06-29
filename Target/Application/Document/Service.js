var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, HashMap, Option, Ref } from "../../effect";
import { Emitter } from "vs/base/common/event.js";
import { ExtHostDocumentData } from "vs/workbench/api/common/extHostDocumentData.js";
import {
  CancellationTokenSource,
  Disposable as VSCodeDisposable
} from "../../Platform/VSCode/Type.js";
import { ToAPI as RangeToAPI } from "../../TypeConverter/Main/Range.js";
import { ToAPI as UriToAPI } from "../../TypeConverter/Main/URI.js";
import { IPCService } from "../IPC/Service.js";
import { LoggerService } from "../Logger/Service.js";
import { ContentProviderProblem } from "./Error.js";
class DocumentService extends Effect.Service()(
  "Service/Document",
  {
    effect: Effect.gen(function* () {
      const IPC = yield* IPCService;
      const Logger = yield* LoggerService;
      const DocumentMap = yield* Ref.make(
        HashMap.empty()
      );
      const ContentProviders = yield* Ref.make(
        HashMap.empty()
      );
      const MainThreadProxy = IPC.CreateProxy(
        "$rpc:mainThreadDocuments"
      );
      const OnDidOpenTextDocumentEmitter = new Emitter();
      const OnDidCloseTextDocumentEmitter = new Emitter();
      const OnDidChangeTextDocumentEmitter = new Emitter();
      const OnDidSaveTextDocumentEmitter = new Emitter();
      const AcceptModelAdded = /* @__PURE__ */ __name((Data) => Effect.gen(function* () {
        const RevivedUri = UriToAPI(Data.uri);
        const DocumentData = new ExtHostDocumentData(
          MainThreadProxy,
          RevivedUri,
          Data.lines,
          Data.eol,
          Data.versionId,
          Data.languageId,
          Data.isDirty,
          Data.encoding
        );
        yield* Ref.update(
          DocumentMap,
          (Map) => HashMap.set(
            Map,
            DocumentData.document.uri.toString(),
            DocumentData
          )
        );
        OnDidOpenTextDocumentEmitter.fire(DocumentData.document);
      }), "AcceptModelAdded");
      const AcceptModelRemoved = /* @__PURE__ */ __name((UriDTO) => Effect.gen(function* () {
        const UriString = UriToAPI(UriDTO).toString();
        const Map = yield* Ref.get(DocumentMap);
        const DocumentData = HashMap.get(Map, UriString);
        if (Option.isSome(DocumentData)) {
          yield* Ref.update(
            DocumentMap,
            (Map2) => HashMap.remove(Map2, UriString)
          );
          OnDidCloseTextDocumentEmitter.fire(
            DocumentData.value.document
          );
        }
      }), "AcceptModelRemoved");
      const AcceptModelChanged = /* @__PURE__ */ __name((UriDTO, ChangeEventDTO) => Effect.gen(function* () {
        const UriString = UriToAPI(UriDTO).toString();
        const DocumentData = yield* Ref.get(DocumentMap).pipe(
          Effect.map(HashMap.get(UriString))
        );
        if (Option.isSome(DocumentData)) {
          const ModelChangedEvent = {
            changes: ChangeEventDTO.changes,
            eol: ChangeEventDTO.eol,
            versionId: ChangeEventDTO.versionId,
            isUndoing: false,
            isRedoing: false
          };
          DocumentData.value.onEvents(ModelChangedEvent);
          OnDidChangeTextDocumentEmitter.fire({
            document: DocumentData.value.document,
            contentChanges: ChangeEventDTO.changes.map(
              (Change) => ({
                range: RangeToAPI(Change.range),
                rangeOffset: Change.rangeOffset,
                rangeLength: Change.rangeLength,
                text: Change.text
              })
            ),
            reason: ChangeEventDTO.reason
          });
        }
      }), "AcceptModelChanged");
      const ProvideTextDocumentContent = /* @__PURE__ */ __name((UriComponents) => Effect.gen(function* () {
        const Uri = UriToAPI(UriComponents);
        const MaybeProvider = yield* Ref.get(ContentProviders).pipe(
          Effect.map(HashMap.get(Uri.scheme))
        );
        if (Option.isNone(MaybeProvider) || !MaybeProvider.value.provideTextDocumentContent) {
          return Option.none();
        }
        const Token = new CancellationTokenSource().token;
        const Content = yield* Effect.promise(
          () => Promise.resolve(
            MaybeProvider.value.provideTextDocumentContent(
              Uri,
              Token
            )
          )
        );
        return Option.fromNullable(Content);
      }).pipe(
        Effect.catchAll(
          (error) => Logger.error(error).pipe(
            Effect.as(Option.none())
          )
        ),
        Effect.map(Option.getOrElse(() => null))
      ), "ProvideTextDocumentContent");
      IPC.RegisterInvokeHandler(
        "$acceptModelAdded",
        ([Data]) => Effect.runPromise(AcceptModelAdded(Data))
      );
      IPC.RegisterInvokeHandler(
        "$acceptModelRemoved",
        ([Uri]) => Effect.runPromise(AcceptModelRemoved(Uri))
      );
      IPC.RegisterInvokeHandler(
        "$acceptModelChanged",
        ([Uri, Changes]) => Effect.runPromise(AcceptModelChanged(Uri, Changes))
      );
      IPC.RegisterInvokeHandler(
        "$provideTextDocumentContent",
        ([UriComponents]) => Effect.runPromise(
          ProvideTextDocumentContent(UriComponents)
        )
      );
      return {
        TextDocuments: Ref.get(DocumentMap).pipe(
          Effect.map(
            (Map) => Array.from(HashMap.values(Map)).map(
              (Data) => Data.document
            )
          )
        ),
        OnDidOpenTextDocument: OnDidOpenTextDocumentEmitter.event,
        OnDidCloseTextDocument: OnDidCloseTextDocumentEmitter.event,
        OnDidChangeTextDocument: OnDidChangeTextDocumentEmitter.event,
        OnDidSaveTextDocument: OnDidSaveTextDocumentEmitter.event,
        GetDocument: /* @__PURE__ */ __name((Uri) => Ref.get(DocumentMap).pipe(
          Effect.map((Map) => HashMap.get(Map, Uri.toString())),
          Effect.map(Option.map((Data) => Data.document))
        ), "GetDocument"),
        RegisterTextDocumentContentProvider: /* @__PURE__ */ __name((Scheme, Provider) => Effect.gen(function* () {
          yield* IPC.SendNotification(
            "$registerTextDocumentContentProvider",
            [Scheme]
          );
          yield* Ref.update(
            ContentProviders,
            (Map) => HashMap.set(Map, Scheme, Provider)
          );
          return new VSCodeDisposable(() => {
            const Unregister = Ref.update(
              ContentProviders,
              (Map) => HashMap.remove(Map, Scheme)
            ).pipe(
              Effect.andThen(
                IPC.SendNotification(
                  "$unregisterTextDocumentContentProvider",
                  [Scheme]
                )
              )
            );
            Effect.runFork(Unregister);
          });
        }).pipe(
          Effect.mapError(
            (Cause) => new ContentProviderProblem({
              Cause,
              Scheme,
              Context: "RegisterProviderFailed"
            })
          )
        ), "RegisterTextDocumentContentProvider")
      };
    })
  }
) {
  static {
    __name(this, "DocumentService");
  }
}
export {
  DocumentService
};
//# sourceMappingURL=Service.js.map
