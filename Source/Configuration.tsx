import type { IWorkbenchConstructionOptions } from "@Editor/vs/workbench/browser/web.api.js";
import {
	createEffect,
	createSignal,
	For,
	onMount,
	Show,
	type Component,
} from "solid-js";
import { createStore, produce } from "solid-js/store";

import Schema from "../generated/workbench-config-schema.json";

const Configuration = {
	// --- Core Local Configuration ---
	// Explicitly set to null to indicate no remote server authority
	remoteAuthority: "",

	// Standard base path for web assets
	serverBasePath: "/",

	// No connection token needed for local
	connectionToken: "",

	// Assume this is the initial load (adjust dynamically if needed)
	// isInitialStartup: true,

	// --- Explicitly Disable/Exclude Remote/Web Features ---
	// Do NOT provide a WebSocket factory
	// webSocketFactory: undefined,

	// Do NOT provide a resource URI provider (used with websockets)
	// resourceUriProvider: undefined,

	// Do NOT provide a remote resource provider
	// remoteResourceProvider: undefined,

	// No remote tunnels needed locally
	// tunnelProvider: undefined,

	// Not needed for local auth (if any)
	// codeExchangeProxyEndpoints: undefined,

	// No cloud edit session initially
	// editSessionId: undefined,

	// --- Workspace & Profile ---
	// Let the backend (Mountain via initData/RPC) determine the workspace after load
	// workspaceProvider: undefined,

	// Keep workspace trust enabled for testing the feature flow
	enableWorkspaceTrust: true,

	// Let the backend manage profiles
	// profile: undefined,

	// No profile preview
	// profileToPreview: undefined,

	// --- Features & Services (Let Backend/Shims Handle) ---
	// Let Cocoon's shim provide the proxy to Mountain's native storage
	// secretStorageProvider: undefined,

	// Disable settings sync for MVP simplicity
	settingsSyncOptions: { enabled: false },

	// Rely on extensions or backend for auth if needed later
	// authenticationProviders: undefined,

	// Rely on Mountain's native protocol handler
	// urlCallbackProvider: undefined,

	// --- Extensions ---
	// Don't force extra built-ins for now
	// additionalBuiltinExtensions: undefined,

	// Don't force enable specific extensions for now
	// enabledExtensions: undefined,

	// --- Branding & UI ---
	productConfiguration: {
		// Identify as desktop-like, might influence some UI/feature paths
		// Important to suggest non-web behavior
		embedderIdentifier: "desktop",

		// Optional: Branding
		nameShort: "FIDDEE",

		// Optional: Branding
		nameLong: "FIDDEE",

		// Optional: Branding
		applicationName: "fiddee",

		// Add other product overrides if needed
	},

	// Use default window indicator
	// windowIndicator: undefined,

	// Use default theme initially
	// initialColorTheme: undefined,

	// No custom banner
	// welcomeBanner: undefined,

	// Use default layout
	// defaultLayout: undefined,

	// No extra default settings from embedder
	// configurationDefaults: undefined,

	// --- Security & Misc ---
	// No extra trusted domains initially
	// additionalTrustedDomains: undefined,

	// No special opener prefixes initially
	// openerAllowedExternalUrlPrefixes: undefined,

	// No custom telemetry properties initially
	// resolveCommonTelemetryProperties: undefined,

	// No extra embedder commands initially
	// commands: undefined,

	// No specific message ports needed for Cocoon/Vine
	// messagePorts: undefined,

	// Keep this from your example, might be harmlessly ignored
	// callbackRoute: "/oss-dev/callback",

	// --- Development ---
	developmentOptions: {
		// Set to Trace (1) or Debug (2) for maximum insight during development
		logLevel: 3,

		enableSmokeTestDriver: false,

		// Only set if running integration tests
		// extensionTestsPath: undefined,

		// Only set if loading specific dev extensions
		// extensions: undefined,
	},

	// --- Update/Quality ---
	// updateProvider: undefined,

	// productQualityChangeHandler: undefined,
} satisfies IWorkbenchConstructionOptions as IWorkbenchConstructionOptions;

const localStorageKey = "landCodeDebugConfig";

// --- Helper Type for Schema Properties ---
// Basic representation, enhance if needed
interface SchemaProperty {
	type: string;

	title?: string;

	description?: string;

	default?: any;

	enum?: any[];

	properties?: Record<string, SchemaProperty>;

	// For arrays
	items?: SchemaProperty;
}

// --- Recursive Renderer Component/Function ---
const SchemaPropertyRenderer: Component<{
	propKey: string;

	propSchema: SchemaProperty;

	currentValue: any;

	// Path for nested updates
	path: string[];

	onUpdate: (path: string[], value: any) => void;
}> = (Property) => {
	const Identifier = () => Property.path.join(".");

	const Change = (event: Event) => {
		const Target = event.currentTarget as
			| HTMLInputElement
			| HTMLSelectElement
			| HTMLTextAreaElement;

		let Value: any;

		if (Target instanceof HTMLInputElement && Target.type === "checkbox") {
			Value = Target.checked;
		} else if (
			Target instanceof HTMLInputElement &&
			Target.type === "number"
		) {
			Value = Target.value === "" ? undefined : parseFloat(Target.value);
		} else if (Target instanceof HTMLTextAreaElement) {
			// Array as JSON
			try {
				Value = JSON.parse(Target.value);

				if (!Array.isArray(Value)) throw new Error("Not an array");
			} catch (_Error) {
				console.warn(
					`Invalid JSON array in textarea for ${Identifier()}:`,

					_Error,
				);

				// Optionally provide visual feedback here
				// Don't update state with invalid JSON
				return;
			}
		} else {
			// Text, Select
			Value = Target.value;

			if (
				Target instanceof HTMLSelectElement &&
				Value === "__undefined__"
			) {
				// Treat empty select as undefined
				Value = undefined;
			}
		}

		Property.onUpdate(Property.path, Value);
	};

	// Determine initial value, considering default from schema
	const _Value = () =>
		Property.currentValue !== undefined
			? Property.currentValue
			: Property.propSchema.default;

	return (
		<div class="Property">
			<label for={Identifier()} title={Property.propSchema.description}>
				{Property.propKey}:{" "}
				{Property.propSchema.title
					? `(${Property.propSchema.title})`
					: ""}
				{/* Optional: Add description span */}
			</label>
			{/* --- Input Types based on Schema --- */}
			{Property.propSchema.type === "string" &&
				!Property.propSchema.enum && (
					<input
						type="text"
						id={Identifier()}
						value={_Value() ?? ""}
						onInput={Change}
					/>
				)}
			{Property.propSchema.type === "boolean" && (
				<input
					type="checkbox"
					id={Identifier()}
					checked={_Value() ?? false}
					onChange={Change}
				/>
			)}
			{(Property.propSchema.type === "number" ||
				Property.propSchema.type === "integer") && (
				<input
					type="number"
					id={Identifier()}
					value={_Value() ?? ""}
					step={Property.propSchema.type === "integer" ? "1" : "any"}
					onInput={Change}
				/>
			)}
			{Property.propSchema.enum && (
				<select id={Identifier()} onChange={Change}>
					<option value="__undefined__">-- Select --</option>{" "}
					{/* Represents undefined */}
					<For each={Property.propSchema.enum}>
						{(enumValue) => (
							<option
								value={String(enumValue)}
								selected={_Value() === enumValue}>
								{String(enumValue)}
							</option>
						)}
					</For>
				</select>
			)}
			{Property.propSchema.type === "object" &&
				Property.propSchema.properties && (
					<fieldset class="config-object">
						<legend>{Property.propKey}</legend>

						<For
							each={Object.entries(
								Property.propSchema.properties,
							)}>
							{([subKey, subSchema]) => (
								<SchemaPropertyRenderer
									propKey={subKey}
									propSchema={subSchema as SchemaProperty}
									// Pass down nested value
									currentValue={_Value()?.[subKey]}
									// Extend path
									path={[...Property.path, subKey]}
									onUpdate={Property.onUpdate}
								/>
							)}
						</For>
					</fieldset>
				)}
			// Basic array handling
			{Property.propSchema.type === "array" && (
				<textarea
					id={Identifier()}
					rows={4}
					// Use input to allow partial JSON validation later if desired
					onInput={Change}>
					{JSON.stringify(_Value() ?? [], null, 2)}
				</textarea>
			)}
			{/* Add handling for other types or show unsupported */}
			{!(
				Property.propSchema.type === "string" &&
				!Property.propSchema.enum
			) &&
				!(Property.propSchema.type === "boolean") &&
				!(
					Property.propSchema.type === "number" ||
					Property.propSchema.type === "integer"
				) &&
				!Property.propSchema.enum &&
				!(
					Property.propSchema.type === "object" &&
					Property.propSchema.properties
				) &&
				!(Property.propSchema.type === "array") && (
					<span>[Unsupported type: {Property.propSchema.type}]</span>
				)}
		</div>
	);
};

// --- Main Editor Component ---
const ConfigEditor: Component = () => {
	// Use createStore for reactive nested object updates
	const [configStore, setConfigStore] = createStore<Record<string, any>>({});

	const [displayJson, setDisplayJson] = createSignal("");

	// Load initial state from LocalStorage or defaults
	const loadConfig = () => {
		console.log("Loading config...");

		const saved = localStorage.getItem(localStorageKey);

		let loadedState;

		try {
			loadedState = saved
				? JSON.parse(saved)
				: // Deep copy default
					JSON.parse(JSON.stringify(Configuration));
		} catch (e) {
			console.error("Failed to parse stored config, using defaults:", e);

			loadedState = JSON.parse(JSON.stringify(Configuration));
		}

		// Reset store completely
		setConfigStore(loadedState);

		console.log("Loaded config state:", loadedState);
	};

	// Save current state to LocalStorage
	const saveConfig = () => {
		try {
			// Prune undefined keys before saving for cleaner JSON
			// Solid's store proxy might need careful handling for stringify
			const plainObject = JSON.parse(JSON.stringify(configStore));

			localStorage.setItem(localStorageKey, JSON.stringify(plainObject));

			console.log("Saved config to LocalStorage.");

			alert(
				"Configuration saved to LocalStorage! Reload the app to see changes (if using dynamic backend loading) or rebuild (if using static meta tag).",
			);
		} catch (e) {
			console.error("Failed to save config:", e);

			alert("Error saving configuration.");
		}
	};

	// Reset state to defaults
	const resetConfig = () => {
		if (
			confirm(
				"Reset configuration to defaults? This will overwrite your LocalStorage settings.",
			)
		) {
			console.log("Resetting config to defaults.");

			// Reset store
			setConfigStore(JSON.parse(JSON.stringify(Configuration)));

			// Optionally save immediately after reset
			// saveConfig();
		}
	};

	// Update the store based on input path and value
	const handleUpdate = (path: string[], value: any) => {
		console.log(
			`Updating store at path [${path.join(".")}] with value:`,

			value,
		);

		// Use produce for easier immutable updates on nested paths
		setConfigStore(
			produce((s) => {
				let current: any = s;

				for (let i = 0; i < path.length - 1; i++) {
					if (
						!current[path[i]] ||
						typeof current[path[i]] !== "object"
					) {
						// Ensure path exists
						current[path[i]] = {};
					}

					current = current[path[i]];
				}

				if (value === undefined) {
					// Remove key if value is undefined
					delete current[path[path.length - 1]];
				} else {
					current[path[path.length - 1]] = value;
				}
			}),
		);
	};

	// Effect to update the JSON display whenever the store changes
	createEffect(() => {
		// Stringify the proxied store object
		// Use JSON.parse(JSON.stringify()) to get a plain object without proxies for display/save
		try {
			const plainObject = JSON.parse(JSON.stringify(configStore));

			setDisplayJson(JSON.stringify(plainObject, null, 2));
		} catch (e) {
			console.error("Error stringifying config store:", e);

			setDisplayJson("Error displaying config.");
		}
	});

	// Load config when the component mounts
	onMount(() => {
		loadConfig();
	});

	return (
		<div class="config-editor-container">
			<h2>Workbench Debug Configuration</h2>

			<p>
				Edit values below and click "Save" to persist in LocalStorage.
			</p>

			<form id="config-form" onSubmit={(e) => e.preventDefault()}>
				{/* Check if schema properties exist before iterating */}

				<Show
					when={Schema?.properties}
					fallback={<p>Loading schema...</p>}>
					<For each={Object.entries(Schema.properties!)}>
						{([key, propSch]) => (
							<SchemaPropertyRenderer
								propKey={key}
								propSchema={propSch as SchemaProperty}
								// Read from store
								currentValue={configStore[key]}
								// Initial path
								path={[key]}
								onUpdate={handleUpdate}
							/>
						)}
					</For>
				</Show>
			</form>

			<div class="config-buttons">
				<button onClick={saveConfig}>Save to LocalStorage</button>

				<button onClick={loadConfig}>Load from LocalStorage</button>

				<button onClick={resetConfig}>Reset to Defaults</button>
			</div>

			<h3>Current Configuration (Live)</h3>

			<pre>{displayJson()}</pre>
		</div>
	);
};

export default ConfigEditor;
