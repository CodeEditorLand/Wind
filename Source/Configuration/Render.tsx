import { type Component, For } from "solid-js";

export default ((Property) => {
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
			Value =
				Target.value === ""
					? undefined
					: Number.parseFloat(Target.value);
		} else if (Target instanceof HTMLTextAreaElement) {
			// Array as JSON
			try {
				Value = JSON.parse(Target.value);

				if (!Array.isArray(Value)) {
					throw new Error("Not an array");
				}
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
								<Render
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
					onInput={Change}
				>
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
}) satisfies Component<{
	propKey: string;

	propSchema: SchemaProperty;

	currentValue: any;

	// Path for nested updates
	path: string[];

	onUpdate: (path: string[], value: any) => void;
}> as Component<{
	propKey: string;

	propSchema: SchemaProperty;

	currentValue: any;

	// Path for nested updates
	path: string[];

	onUpdate: (path: string[], value: any) => void;
}>;
