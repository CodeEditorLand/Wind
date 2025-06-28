import { Layer } from "../effect";
import { ClipboardLive } from "./Clipboard/Live.js";
import { ConfigurationLive } from "./Configuration/Live.js";
import { DialogLive } from "./Dialog/Live.js";
import { DocumentLive } from "./Document/Live.js";
import { EditorLive } from "./Editor/Live.js";
import { EditorGroupsLive } from "./EditorGroups/Live.js";
import { FileLive } from "./File/Live.js";
import { FileSystemProviderLive } from "./FileSystem/Live.js";
import { HostLive } from "./Host/Live.js";
import { LanguageFeatureLive } from "./LanguageFeature/Live.js";
import { LogLive } from "./Log/Live.js";
import { MarkerLive } from "./Marker/Live.js";
import { QuickInputLive } from "./QuickInput/Live.js";
import { SourceControlManagementLive } from "./SourceControlManagement/Live.js";
import { StorageLive } from "./Storage/Live.js";
import { TextEditorLive } from "./TextEditor/Live.js";
import { TreeViewLive } from "./TreeView/Live.js";
import { IntegrationLive } from "Source/Integration/Tauri/Live.js";
const AppLayer = Layer.mergeAll(
  ClipboardLive,
  ConfigurationLive,
  DialogLive,
  DocumentLive,
  EditorLive,
  EditorGroupsLive,
  FileLive,
  FileSystemProviderLive,
  HostLive,
  LanguageFeatureLive,
  LogLive,
  MarkerLive,
  QuickInputLive,
  SourceControlManagementLive,
  StorageLive,
  TextEditorLive,
  TreeViewLive
).pipe(Layer.provide(IntegrationLive));
export {
  AppLayer
};
//# sourceMappingURL=Layer.js.map
