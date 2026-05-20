/**
 * @module FileSystem/Implementation/MountainCommands
 *
 * Mountain IPC command names for file-system operations.
 * Must stay in lockstep with the dispatch table in:
 * Element/Mountain/Source/IPC/WindServiceHandlers/FileSystem/
 */

export const MountainCommands = {
	READ: "file:read",
	WRITE: "file:write",
	STAT: "file:stat",
	DELETE: "file:delete",
	/** Mountain has no separate `rmdir`; delete handles both files and dirs. */
	RMDIR: "file:delete",
	MKDIR: "file:mkdir",
	READDIR: "file:readdir",
	COPY: "file:copy",
	MOVE: "file:move",
} as const;
