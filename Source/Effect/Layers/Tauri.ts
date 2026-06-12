1|/**
2| * @module Effect/Layers/Tauri
3| * @description
4| * Complete Effect layer stack for Tauri runtime.
5| * Composes all atomic services into a runnable layer.
6| */
7|
9|
10|import { LiveClipboardServiceLayer as ClipboardLive } from "../Clipboard.js";
11|import { LiveCommandsServiceLayer as CommandsLive } from "../Commands/Commands.js";
12|import { LiveDecorationsServiceLayer as DecorationsLive } from "../Decorations/Decorations.js";
13|import { LiveEditorServiceLayer as EditorLive } from "../Editor/Editor.js";
14|import { LiveEnvironmentService as EnvironmentLive } from "../Environment.js";
15|import { LiveExtensionsServiceLayer as ExtensionsLive } from "../Extensions/Extensions.js";
16|import { LiveFilesService as FilesLive } from "../Files/Files.js";
17|import { LiveHistoryServiceLayer as HistoryLive } from "../History/History.js";
18|import { LiveKeybindingServiceLayer as KeybindingLive } from "../Keybinding/Keybinding.js";
19|import { LiveLabelServiceLayer as LabelLive } from "../Label/Label.js";
20|import { LiveLanguageServiceLayer as LanguageLive } from "../Language/Language.js";
21|import { LiveLifecycleServiceLayer as LifecycleLive } from "../Lifecycle/Lifecycle.js";
22|import { LiveModelService as ModelLive } from "../Model/Model.js";
23|import { MountainSyncLive } from "../MountainSync.js";
24|import { LiveNotificationServiceLayer as NotificationLive } from "../Notification/Notification.js";
25|import { LiveOutputServiceLayer as OutputLive } from "../Output/Output.js";
26|import { LivePanelService as PanelLive } from "../Panel.js";
27|import { LiveProgressServiceLayer as ProgressLive } from "../Progress/Progress.js";
28|import { LiveQuickInputServiceLayer as QuickInputLive } from "../QuickInput/QuickInput.js";
29|import { SandboxLive } from "../Sandbox.js";
30|import { LiveSearchServiceLayer as SearchLive } from "../Search/Search.js";
31|import { SidebarLive } from "../Sidebar.js";
32|import { LiveStatusBarService as StatusBarLive } from "../StatusBar.js";
33|import { LiveStorageServiceLayer as StorageLive } from "../Storage/Storage.js";
34|import { TelemetryLive } from "../Telemetry.js";
35|import { LiveTerminalServiceLayer as TerminalLive } from "../Terminal/Terminal.js";
36|import { default as LiveTextFileServiceLayer } from "../TextFile/Live.js";
37|import { LiveTextModelResolverServiceLayer as TextModelResolverLive } from "../TextModelResolver/TextModelResolver.js";
38|import { LiveThemesServiceLayer as ThemesLive } from "../Themes/Themes.js";
39|import { LiveWorkingCopyServiceLayer as WorkingCopyLive } from "../WorkingCopy/WorkingCopy.js";
40|import { LiveWorkspacesServiceLayer as WorkspacesLive } from "../Workspaces/Workspaces.js";
41|
42|// ============================================================================
43|// Base Tauri Layer (without config sync)
44|// ============================================================================
45|
46|/**
47| * Base Tauri layer stack - services composed in a single Layer.mergeAll
48| * instead of 40+ chained .pipe(Layer.provideMerge) calls, reducing
49| * intermediate composition objects from O(n) to O(1).
50| *
51| * Provides: Sandbox + IPC + Telemetry + UI Services. Configuration and
52| * Mountain are plain services exported from their Implementation modules.
53| *
54| * Use this when you need manual control over configuration sync.
55| */
56|const BaseServices = Layer.mergeAll(
57|	SandboxLive,
58|
59|	EnvironmentLive,
60|
61|	ClipboardLive,
62|
63|	TelemetryLive,
64|
65|	MountainSyncLive,
66|
67|	PanelLive,
68|
69|	SidebarLive,
70|
71|	StatusBarLive,
72|
73|	CommandsLive,
74|
75|	FilesLive,
76|
77|	LanguageLive,
78|
79|	ExtensionsLive,
80|
81|	EditorLive,
82|
83|	TerminalLive,
84|
85|	OutputLive,
86|
87|	LiveTextFileServiceLayer,
88|
89|	StorageLive,
90|
91|	NotificationLive,
92|
93|	ProgressLive,
94|
95|	QuickInputLive,
96|
97|	WorkspacesLive,
98|
99|	ThemesLive,
100|
101|	SearchLive,
102|
103|	DecorationsLive,
104|
105|	WorkingCopyLive,
106|
107|	KeybindingLive,
108|
109|	LifecycleLive,
110|
111|	HistoryLive,
112|
113|	LabelLive,
114|
115|	ModelLive,
116|
117|	TextModelResolverLive,
118|);
119|
120|export const TauriBaseLayer = BaseServices;
121|
122|// ============================================================================
123|// Full Tauri Layer (with auto config sync)
124|// ============================================================================
125|
126|/**
127| * Full Tauri layer stack.
128| * Provides: All base services. Mountain-driven configuration sync runs
129| * inside the plain Mountain service while connected.
130| */
131|export const TauriLiveLayer = Layer.mergeAll(
132|	SandboxLive,
133|
134|	EnvironmentLive,
135|
136|	ClipboardLive,
137|
138|	TelemetryLive,
139|
140|	MountainSyncLive,
141|
142|	PanelLive,
143|
144|	SidebarLive,
145|
146|	StatusBarLive,
147|
148|	CommandsLive,
149|
150|	FilesLive,
151|
152|	LanguageLive,
153|
154|	ExtensionsLive,
155|
156|	EditorLive,
157|
158|	TerminalLive,
159|
160|	OutputLive,
161|
162|	LiveTextFileServiceLayer,
163|
164|	StorageLive,
165|
166|	NotificationLive,
167|
168|	ProgressLive,
169|
170|	QuickInputLive,
171|
172|	WorkspacesLive,
173|
174|	ThemesLive,
175|
176|	SearchLive,
177|
178|	DecorationsLive,
179|
180|	WorkingCopyLive,
181|
182|	KeybindingLive,
183|
184|	LifecycleLive,
185|
186|	HistoryLive,
187|
188|	LabelLive,
189|
190|	ModelLive,
191|
192|	TextModelResolverLive,
193|);
194|
195|// ============================================================================
196|// Tauri Development Layer (with verbose logging)
197|// ============================================================================
198|
199|/**
200| * Tauri layer with maximum telemetry and logging.
201| * Useful for debugging and development - subset of services
202| * sufficient for interactive debugging without full editor stack.
203| */
204|export const TauriDevLayer = Layer.mergeAll(
205|	SandboxLive,
206|
207|	EnvironmentLive,
208|
209|	ClipboardLive,
210|
211|	TelemetryLive,
212|
213|	MountainSyncLive,
214|
215|	PanelLive,
216|
217|	SidebarLive,
218|
219|	StatusBarLive,
220|);
221|
222|// Export default for convenience
223|export default TauriLiveLayer;
224|
