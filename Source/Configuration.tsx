import type { IWorkbenchConstructionOptions } from "@Editor/vs/workbench/browser/web.api.js";

import Schema from "../generated/workbench-config-schema.json";

export const { default: Render } = await import(
	"@Source/Configuration/Render.jsx"
);

export const { createEffect, createSignal, For, onMount, Show } = await import(
	"solid-js"
);

export const { createStore, produce } = await import("solid-js/store");

const Default = {
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

const KeyLocal = "Configuration";

interface SchemaProperty {
	type: string;

	title?: string;

	description?: string;

	default?: any;

	enum?: any[];

	properties?: Record<string, SchemaProperty>;

	items?: SchemaProperty;
}

export default () => {
	const [configStore, setConfigStore] = createStore<Record<string, any>>({});

	const [Display, setDisplayJson] = createSignal("");

	const Load = () => {
		console.log("Loading config...");

		const Saved = localStorage.getItem(KeyLocal);

		let Loaded;

		try {
			Loaded = Saved
				? JSON.parse(Saved)
				: JSON.parse(JSON.stringify(Default));
		} catch (e) {
			console.error("Failed to parse stored config, using defaults:", e);

			Loaded = JSON.parse(JSON.stringify(Default));
		}

		setConfigStore(Loaded);

		console.log("Loaded config state:", Loaded);
	};

	const Save = () => {
		try {
			localStorage.setItem(
				KeyLocal,
				JSON.stringify(JSON.parse(JSON.stringify(configStore))),
			);

			console.log("Saved config to LocalStorage.");

			alert(
				"Configuration saved to LocalStorage! Reload the app to see changes (if using dynamic backend loading) or rebuild (if using static meta tag).",
			);
		} catch (e) {
			console.error("Failed to save config:", e);

			alert("Error saving configuration.");
		}
	};

	const Reset = () => {
		if (
			confirm(
				"Reset configuration to defaults? This will overwrite your LocalStorage settings.",
			)
		) {
			console.log("Resetting config to defaults.");

			setConfigStore(JSON.parse(JSON.stringify(Default)));

			// Optionally save immediately after reset
			// saveConfig();
		}
	};

	const Update = (path: string[], value: any) => {
		console.log(
			`Updating store at path [${path.join(".")}] with value:`,

			value,
		);

		setConfigStore(
			produce((s) => {
				let current: any = s;

				for (let i = 0; i < path.length - 1; i++) {
					if (
						!current[path[i]] ||
						typeof current[path[i]] !== "object"
					) {
						current[path[i]] = {};
					}

					current = current[path[i]];
				}

				if (value === undefined) {
					delete current[path[path.length - 1]];
				} else {
					current[path[path.length - 1]] = value;
				}
			}),
		);
	};

	createEffect(() => {
		try {
			setDisplayJson(
				JSON.stringify(
					JSON.parse(JSON.stringify(configStore)),
					null,
					2,
				),
			);
		} catch (_Error) {
			console.error("Error stringifying config store:", _Error);

			setDisplayJson("Error displaying config.");
		}
	});

	onMount(() => {
		Load();
	});

	return (
		<div class="config-editor-container">
			<h2>Workbench Debug Configuration</h2>

			<p>
				Edit values below and click "Save" to persist in LocalStorage.
			</p>

			<form id="config-form" onSubmit={(e) => e.preventDefault()}>
				<Show
					when={Schema?.properties}
					fallback={<p>Loading schema...</p>}>
					<For each={Object.entries(Schema.properties!)}>
						{([Key, propSch]) => (
							<Render
								propKey={Key}
								propSchema={propSch as SchemaProperty}
								currentValue={configStore[Key]}
								path={[Key]}
								onUpdate={Update}
							/>
						)}
					</For>
				</Show>
			</form>

			<div class="config-buttons">
				<button onClick={Save}>Save to LocalStorage</button>

				<button onClick={Load}>Load from LocalStorage</button>

				<button onClick={Reset}>Reset to Defaults</button>
			</div>

			<h3>Current Configuration (Live)</h3>

			<pre>{Display()}</pre>
		</div>
	);
};
