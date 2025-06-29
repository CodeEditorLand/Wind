/**
 * @module StatusBarItem (Application/StatusBar)
 * @description The concrete implementation of the `vscode.StatusBarItem` interface.
 * An instance of this class represents a single status bar item from the
 * application's perspective, proxying all state changes to the `Mountain` host.
 */

import { Effect } from "effect";
import type { IExtensionDescription } from "vs/platform/extensions/common/extensions.js";
import type {
	AccessibilityInformation,
	CancellationToken,
	MarkdownString,
	ProviderResult,
	StatusBarAlignment,
	ThemeColor,
	Command as VSCodeCommand,
	StatusBarItem as VSCodeStatusBarItem,
} from "vscode";

import { FromAPI as StatusBarItemToDTO } from "../../TypeConverter/StatusBar.js";
import { CommandService } from "../Command/Service.js";
import type { HostService } from "../Host/Service.js";

/**
 * A concrete implementation of the `vscode.StatusBarItem` interface.
 */
export class StatusBarItemImplementation implements VSCodeStatusBarItem {
	private IsDisposed = false;
	private IsVisible = false;
	private _id: string;
	private _name: string | undefined;
	private _alignment: StatusBarAlignment;
	private _priority: number | undefined;
	private _text = "";
	private _tooltip: string | MarkdownString | undefined;
	private _color: string | ThemeColor | undefined;
	private _backgroundColor: ThemeColor | undefined;
	private _command: string | VSCodeCommand | undefined;
	private _accessibilityInformation: AccessibilityInformation | undefined;

	constructor(
		private readonly EntryId: string,
		private readonly Extension: IExtensionDescription,
		private readonly Host: HostService,
		private readonly Command: CommandService,
		private readonly OnDidDispose: () => void,
		InitialId: string,
		InitialAlignment: StatusBarAlignment,
		InitialPriority?: number,
	) {
		this._id = InitialId;
		this._alignment = InitialAlignment;
		this._priority = InitialPriority;
	}
	tooltip2:
		| string
		| MarkdownString
		| ((
				token: CancellationToken,
		  ) => ProviderResult<string | MarkdownString | undefined>)
		| undefined;

	// Getters
	get id(): string {
		return this._id;
	}
	get alignment(): StatusBarAlignment {
		return this._alignment;
	}
	get priority(): number | undefined {
		return this._priority;
	}
	get name(): string | undefined {
		return this._name;
	}
	get text(): string {
		return this._text;
	}
	get tooltip(): string | MarkdownString | undefined {
		return this._tooltip;
	}
	get color(): string | ThemeColor | undefined {
		return this._color;
	}
	get backgroundColor(): ThemeColor | undefined {
		return this._backgroundColor;
	}
	get command(): string | VSCodeCommand | undefined {
		return this._command;
	}
	get accessibilityInformation(): AccessibilityInformation | undefined {
		return this._accessibilityInformation;
	}

	// Setters with update logic
	set name(Value: string | undefined) {
		if (this._name !== Value) {
			this._name = Value;
			this.Update();
		}
	}
	set text(Value: string) {
		if (this._text !== Value) {
			this._text = Value;
			this.Update();
		}
	}
	set tooltip(Value: string | MarkdownString | undefined) {
		if (this._tooltip !== Value) {
			this._tooltip = Value;
			this.Update();
		}
	}
	set color(Value: string | ThemeColor | undefined) {
		if (this._color !== Value) {
			this._color = Value;
			this.Update();
		}
	}
	set backgroundColor(Value: ThemeColor | undefined) {
		if (this._backgroundColor !== Value) {
			this._backgroundColor = Value;
			this.Update();
		}
	}
	set command(Value: string | VSCodeCommand | undefined) {
		if (this._command !== Value) {
			this._command = Value;
			this.Update();
		}
	}
	set accessibilityInformation(Value: AccessibilityInformation | undefined) {
		if (this._accessibilityInformation !== Value) {
			this._accessibilityInformation = Value;
			this.Update();
		}
	}

	public show(): void {
		if (!this.IsVisible) {
			this.IsVisible = true;
			this.Update();
		}
	}

	public hide(): void {
		if (this.IsVisible) {
			this.IsVisible = false;
			Effect.runFork(this.Host.DisposeStatusBarItem(this.EntryId));
		}
	}

	public dispose(): void {
		if (!this.IsDisposed) {
			this.IsDisposed = true;
			this.hide();
			this.OnDidDispose();
		}
	}

	private Update(): void {
		if (this.IsDisposed || !this.IsVisible) {
			return;
		}

		// The CommandConverter needs to be created on-the-fly as it may
		// register temporary commands.
		const CommandConverter = new CommandConverter(
			this.Command.registerCommand,
			this.Command.executeCommand as any,
			() => undefined, // lookupAPICommand is stubbed
		);

		const DTO = StatusBarItemToDTO(
			this,
			this.EntryId,
			this.Extension,
			CommandConverter,
		);
		Effect.runFork(this.Host.SetStatusBarItem(DTO));
	}
}
