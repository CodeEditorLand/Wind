import { Layer } from "../effect";
import { IntegrationLive } from "../Integration/Tauri/Live.js";
import { ClipboardLive } from "./Clipboard/Live.js";
import { ConfigurationLive } from "./Configuration/Live.js";
import { DialogLive } from "./Dialog/Live.js";
import { DocumentLive } from "./Document/Live.js";
import { EditorLive } from "./Editor/Live.js";
import { EditorGroupLive } from "./EditorGroup/Live.js";
import { FileLive } from "./File/Live.js";
import { FileSystemLive } from "./FileSystem/Live.js";
import { HostLive } from "./Host/Live.js";
import { LanguageFeatureLive } from "./LanguageFeature/Live.js";
import { LogLive } from "./Logger/Live.js";
import { MarkerLive } from "./Marker/Live.js";
import { QuickInputLive } from "./QuickInput/Live.js";
import { SourceControlManagementLive } from "./SourceControlManagement/Live.js";
import { StorageLive } from "./Storage/Live.js";
import { TextEditorLive } from "./TextEditor/Live.js";
import { TreeViewLive } from "./TreeView/Live.js";
const AppLayer = Layer.mergeAll(
  ClipboardLive,
  ConfigurationLive,
  DialogLive,
  DocumentLive,
  EditorLive,
  EditorGroupLive,
  FileLive,
  FileSystemLive,
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
