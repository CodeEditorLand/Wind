// Source/Integration/Tauri/Search.ts
import { spawn } from "child_process";
import { Effect, Queue, Stream } from "effect";

import { RipgrepError } from "../../Application/Search/Error/SearchProblem.js";

// This is the core of the new implementation. It turns a command into a hot Stream.
// It is "hot" because it starts emitting as soon as it's created, via a Queue.
const streamFromCommand = (
	command: string,
	args: string[],
	options: { cwd: string },
) =>
	Stream.fromEffect(
		Effect.gen(function* (_) {
			const queue = yield* _(Queue.unbounded<string>());
			const stderr: string[] = [];

			const process = spawn(command, args, options);

			// Handle stream data
			process.stdout.on("data", (data) => {
				const lines = data.toString().trim().split("\n");
				for (const line of lines) {
					if (line) {
						Queue.unsafeOffer(queue, line); // Unsafe offer is fine in this single-producer context
					}
				}
			});

			// Handle errors and completion
			process.stderr.on("data", (data) => stderr.push(data.toString()));
			process.on("close", (code) => {
				if (code === 0 || code === 1) {
					// rg exits 1 for no results
					Queue.shutdown(queue);
				} else {
					Queue.fail(
						queue,
						new RipgrepError({
							cause: "Process exited",
							exitCode: code,
							stderr: stderr.join(""),
						}),
					);
				}
			});

			process.on("error", (err) =>
				Queue.fail(
					queue,
					new RipgrepError({
						cause: err,
						exitCode: -1,
						stderr: stderr.join(""),
					}),
				),
			);

			// The stream is the queue itself
			return Stream.fromQueue(queue).pipe(
				// Ensure the child process is killed when the stream is interrupted
				Stream.ensuring(Effect.sync(() => process.kill())),
			);
		}),
	).pipe(Stream.flatten); // Flatten the inner stream

// Our main integration point with the ripgrep binary.
export const RipgrepSearch = (
	query: IFileQuery,
	folderQuery: IFolderQuery,
): Stream.Stream<string, RipgrepError> => {
	// ... logic from `spawnRipgrepCmd` to build args would go here ...
	const { command, args, options } = buildRipgrepArgs(query, folderQuery); // Placeholder for arg building

	return streamFromCommand(command, args, { cwd: options.cwd });
};

// Placeholder for the complex argument building logic from the original file
const buildRipgrepArgs = (query: IFileQuery, folderQuery: IFolderQuery) => {
	// This would contain the logic from `spawnRipgrepCmd`
	return {
		command: "rg",
		args: ["--files", "."],
		options: { cwd: folderQuery.folder.fsPath },
	};
};
