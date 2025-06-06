import { Emitter, Event } from "vs/base/common/event.js";
import type {
	IQuickPick,
	IQuickPickItem,
} from "vs/platform/quickinput/common/quickInput.js";

// A No-Op implementation for quick input controls that are not supported
// in a native-first UI approach.
export class NoOpQuickInput implements IQuickPick<IQuickPickItem> {
	readonly type = "quickPick" as const;
	readonly onDidHide = Event.None;
	readonly onWillHide = Event.None;
	readonly onDispose = Event.None;
	readonly onDidChangeValue = Event.None;
	readonly onWillAccept = Event.None;
	readonly onDidAccept = Event.None;
	readonly onDidCustom = Event.None;
	readonly onDidTriggerItemButton = Event.None;
	readonly onDidTriggerSeparatorButton = Event.None;
	readonly onDidChangeActive = Event.None;
	readonly onDidChangeSelection = Event.None;
	readonly onDidTriggerButton = Event.None;

	title = undefined;
	description = undefined;
	widget = undefined;
	step = undefined;
	totalSteps = undefined;
	buttons = [];
	enabled = false;
	contextKey = undefined;
	busy = false;
	ignoreFocusOut = false;
	value = "";
	filterValue = (value: string) => value;
	ariaLabel = undefined;
	placeholder = undefined;
	canAcceptInBackground = false;
	ok: boolean | "default" = false;
	okLabel = undefined;
	customButton = false;
	customLabel = undefined;
	customHover = undefined;
	items = [];
	canSelectMany = false;
	matchOnDescription = false;
	matchOnDetail = false;
	matchOnLabel = true;
	matchOnLabelMode = "fuzzy" as const;
	sortByLabel = true;
	keepScrollPosition = false;
	quickNavigate = undefined;
	activeItems = [];
	itemActivation = 0;
	selectedItems = [];
	keyMods = { alt: false, ctrlCmd: false };
	valueSelection = undefined;
	validationMessage = undefined;
	severity = 0;
	hideInput = false;
	hideCountBadge = false;
	hideCheckAll = false;
	toggles = undefined;

	show(): void {}
	hide(): void {}
	didHide(): void {}
	willHide(): void {}
	focus(): void {}
	accept(): void {}
	inputHasFocus(): boolean {
		return false;
	}
	focusOnInput(): void {}
	dispose(): void {}
}
