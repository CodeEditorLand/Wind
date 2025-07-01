/**
 * @module StatusBarItem (Application/StatusBar)
 * @description The concrete implementation of the `vscode.StatusBarItem` interface.
 * An instance of this class represents a single status bar item from the
 * application's perspective, proxying all state changes to the `Mountain` host.
 */
import type { IExtensionDescription } from "vs/platform/extensions/common/extensions.js";
import type { AccessibilityInformation, StatusBarAlignment, Command as VSCodeCommand, StatusBarItem as VSCodeStatusBarItem } from "vscode";
import { ThemeColor, type IMarkdownString } from "../../Platform/VSCode/Type.js";
import { CommandService } from "../Command/Service.js";
import type { HostService } from "../Host/Service.js";
/**
 * A concrete implementation of the `vscode.StatusBarItem` interface.
 */
export declare class StatusBarItemImplementation implements VSCodeStatusBarItem {
    private readonly EntryId;
    private readonly Extension;
    private readonly Host;
    private readonly Command;
    private readonly OnDidDispose;
    private IsDisposed;
    private IsVisible;
    private _id;
    private _name;
    private _alignment;
    private _priority;
    private _text;
    private _tooltip;
    private _color;
    private _backgroundColor;
    private _command;
    private _accessibilityInformation;
    constructor(EntryId: string, Extension: IExtensionDescription, Host: HostService, Command: CommandService, OnDidDispose: () => void, InitialId: string, InitialAlignment: StatusBarAlignment, InitialPriority?: number);
    get id(): string;
    get alignment(): StatusBarAlignment;
    get priority(): number | undefined;
    get name(): string | undefined;
    get text(): string;
    get tooltip(): string | IMarkdownString | undefined;
    get color(): string | typeof ThemeColor | undefined;
    get backgroundColor(): typeof ThemeColor | undefined;
    get command(): string | VSCodeCommand | undefined;
    get accessibilityInformation(): AccessibilityInformation | undefined;
    set name(Value: string | undefined);
    set text(Value: string);
    set tooltip(Value: string | IMarkdownString | undefined);
    set color(Value: string | typeof ThemeColor | undefined);
    set backgroundColor(Value: typeof ThemeColor | undefined);
    set command(Value: string | VSCodeCommand | undefined);
    set accessibilityInformation(Value: AccessibilityInformation | undefined);
    show(): void;
    hide(): void;
    dispose(): void;
    private Update;
}
