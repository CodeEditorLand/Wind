/**
 * @module Item
 * @description
 * This module contains the concrete implementation of the `vscode.StatusBarItem`
 * interface. An instance of this class represents a single status bar item from
 * the application's perspective, proxying all state changes to the `Mountain` host.
 */

import type { IExtensionDescription } from "@codeeditorland/output/vs/platform/extensions/common/extensions.js";
import { Effect } from "effect";
import type {
	AccessibilityInformation,
	StatusBarAlignment,
	Command as VSCodeCommand,
	StatusBarItem as VSCodeStatusBarItem,
} from "vscode";

import {
	ThemeColor,
	type IMarkdownString,
} from "../../Platform/Vscode/Type.js";
import { MarshalCommand } from "../Command/Convert.js";
import type { Interface as CommandService } from "../Command/Define.js";
import type { Interface as HostService } from "../Host/Define.js";
import { FromAPI as ConvertStatusBarItemToDTO } from "./Convert.js";

/**
 * A concrete implementation of the `vscode.StatusBarItem` interface. Each
 * instance of this class controls a single item in the UI's status bar by
 * proxying state changes to the `HostService`.
 */
export class StatusBarItemImplementation implements VSCodeStatusBarItem {
	private _IsDisposed = false;
	private _IsVisible = false;

	private _id: string;
	private _name: string | undefined;
	private _alignment: StatusBarAlignment;
	private _priority: number | undefined;
	private _text = "";
	private _tooltip: string | IMarkdownString | undefined;
	private _color: string | typeof ThemeColor | undefined;
	private _backgroundColor: typeof ThemeColor | undefined;
	private _command: string | VSCodeCommand | undefined;
	private _accessibilityInformation: AccessibilityInformation | undefined;

	constructor(
		private readonly _EntryID: string,
		private readonly _Extension: IExtensionDescription,
		private readonly _Host: HostService,
		private readonly _CommandService: CommandService,
		private readonly _OnDidDispose: () => void,
		InitialID: string,
		InitialAlignment: StatusBarAlignment,
		InitialPriority?: number,
	) {
		this._id = InitialID;
		this._alignment = InitialAlignment;
		this._priority = InitialPriority;
	}

	// --- Getters ---
	public get id(): string {
		return this._id;
	}
	public get alignment(): StatusBarAlignment {
		return this._alignment;
	}
	public get priority(): number | undefined {
		return this._priority;
	}
	public get name(): string | undefined {
		return this._name;
	}
	public get text(): string {
		return this._text;
	}
	public get tooltip(): string | IMarkdownString | undefined {
		return this._tooltip;
	}
	public get color(): string | typeof ThemeColor | undefined {
		return this._color;
	}
	public get backgroundColor(): typeof ThemeColor | undefined {
		return this._backgroundColor;
	}
	public get command(): string | VSCodeCommand | undefined {
		return this._command;
	}
	public get accessibilityInformation():
		| AccessibilityInformation
		| undefined {
		return this._accessibilityInformation;
	}

	// --- Setters ---
	public set name(Value: string | undefined) {
		if (this._name !== Value) {
			this._name = Value;
			this.Update();
		}
	}
	public set text(Value: string) {
		if (this._text !== Value) {
			this._text = Value;
			this.Update();
		}
	}
	public set tooltip(Value: string | IMarkdownString | undefined) {
		if (this._tooltip !== Value) {
			this._tooltip = Value;
			this.Update();
		}
	}
	public set color(Value: string | typeof ThemeColor | undefined) {
		if (this._color !== Value) {
			this._color = Value;
			this.Update();
		}
	}
	public set backgroundColor(Value: typeof ThemeColor | undefined) {
		if (this._backgroundColor !== Value) {
			this._backgroundColor = Value;
			this.Update();
		}
	}
	public set command(Value: string | VSCodeCommand | undefined) {
		if (this._command !== Value) {
			this._command = Value;
			this.Update();
		}
	}
	public set accessibilityInformation(
		Value: AccessibilityInformation | undefined,
	) {
		if (this._accessibilityInformation !== Value) {
			this._accessibilityInformation = Value;
			this.Update();
		}
	}

	public show(): void {
		if (!this._IsVisible) {
			this._IsVisible = true;
			this.Update();
		}
	}

	public hide(): void {
		if (this._IsVisible) {
			this._IsVisible = false;
			Effect.runFork(this._Host.DisposeStatusBarItem(this._EntryID));
		}
	}

	public dispose(): void {
		if (!this._IsDisposed) {
			this._IsDisposed = true;
			this.hide();
			this._OnDidDispose();
		}
	}

	/**
	 * Sends the current state of the item to the host to be rendered.
	 * This method is called automatically when any property changes.
	 */
	private Update(): void {
		if (this._IsDisposed || !this._IsVisible) {
			return;
		}

		const CommandMarshaller = new MarshalCommand(this._CommandService);

		const DTO = ConvertStatusBarItemToDTO(
			this,
			this._EntryID,
			CommandMarshaller,
		);
		Effect.runFork(this._Host.SetStatusBarItem(DTO));
	}
}
