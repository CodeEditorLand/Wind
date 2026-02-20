# FileSystem Provider Service

Mountain-backed file system provider for VSCode browser workbench.

## Overview

This service enables the VSCode browser workbench to access the file system
through Mountain's Tauri IPC handlers. It implements a VSCode-like
`IFileSystemProvider` interface that communicates with Mountain's file system
operations.

## Architecture

```
VSCode Browser Workbench
    ↓ (IFileSystemProvider interface)
FileSystemProvider (Wind/TypeScript)
    ↓ (Tauri IPC Commands)
Mountain IPC Handlers (Rust)
    ↓ (FileSystemReader/FileSystemWriter)
Native File System
```

## Features

- **File Operations**: Read, write, delete, copy, move files
- **Directory Operations**: List contents, create, remove directories
- **Metadata**: Get file statistics (size, type, timestamps)
- **URI Handling**: Convert between VSCode URIs (`file:///path/to/file`) and
  file system paths
- **Error Handling**: Comprehensive error types for different failure modes
- **Effect-TS Integration**: Full Effect-TS pattern support for functional
  composition

## Mountain IPC Commands

The service invokes these Mountain IPC commands (defined in
`Element/Mountain/Source/IPC/WindServiceHandlers.rs`):

| Command        | Description                | Parameters                              |
| -------------- | -------------------------- | --------------------------------------- |
| `file:read`    | Read file contents         | `path: string`                          |
| `file:write`   | Write file contents        | `path: string`, `content: string`       |
| `file:stat`    | Get file metadata          | `path: string`                          |
| `file:delete`  | Delete file/directory      | `path: string`                          |
| `file:copy`    | Copy file/directory        | `source: string`, `destination: string` |
| `file:move`    | Move/rename file/directory | `source: string`, `destination: string` |
| `file:mkdir`   | Create directory           | `path: string`, `recursive: boolean`    |
| `file:readdir` | List directory contents    | `path: string`                          |

## Usage

### Basic Usage

```typescript
import { Effect } from "effect";

import { FileSystemProviderTag } from "./FileSystem/index.js";

// Get the service
const program = Effect.gen(function* () {
	const fs = yield* FileSystemProviderTag;

	// Read a file
	const content = yield* fs.readFile("file:///path/to/file.txt");
	console.log(content);

	// List directory
	const entries = yield* fs.readdir("file:///path/to/dir");
	console.log(entries);

	// Get file stats
	const stats = yield* fs.stat("file:///path/to/file.txt");
	console.log(stats);
});
```

### Using URIs

```typescript
import { URI } from "./FileSystem/index.js";

// Create a file URI
const fileUri = URI.file("/path/to/file.txt");
console.log(fileUri.toString()); // "file:///path/to/file.txt"

// Parse a URI
const parsed = URI.parse("file:///path/to/file.txt");
console.log(parsed.fsPath()); // "/path/to/file.txt"
console.log(parsed.basename()); // "file.txt"
console.log(parsed.dirname()); // URI of "/path/to"
```

### Error Handling

```typescript
import {
	FileExistsError,
	FileNotFoundError,
	PermissionError,
	toFileSystemProviderError,
} from "./FileSystem/index.js";

try {
	// ...
} catch (error) {
	const fsError = toFileSystemProviderError(
		error,
		"readFile",
		"/path/to/file",
	);

	if (fsError instanceof FileNotFoundError) {
		console.log("File not found:", fsError.message);
	} else if (fsError instanceof PermissionError) {
		console.log("Permission denied:", fsError.message);
	}
}
```

### Layer Composition

```typescript
import { Layer } from "effect";

import { IPCTauriLive } from "./Effect/IPC.js";
import {
	FileSystemProviderLive,
	FileSystemProviderTag,
} from "./FileSystem/index.js";

// Create the FileSystem layer
const FileSystemLayer = FileSystemProviderLive.pipe(
	Layer.provide(IPCTauriLive),
);

// Use in runtime
const program = Effect.gen(function* () {
	const fs = yield* FileSystemProviderTag;
	// ...
}).pipe(Effect.provide(FileSystemLayer));
```

## File Types

```typescript
import { FileType } from "./FileSystem/index.js";

if (stats.type === FileType.File) {
	console.log("This is a file");
} else if (stats.type === FileType.Directory) {
	console.log("This is a directory");
} else if (stats.type === FileType.SymbolicLink) {
	console.log("This is a symbolic link");
}
```

## Module Structure

```
FileSystem/
├── Type/
│   ├── FileType.ts              # File type enumeration
│   ├── URI.ts                   # VSCode-like URI class
│   ├── FileSystemType.ts        # Interface and type definitions
│   └── index.ts                 # Type exports
├── Interface/
│   └── FileSystemProvider.ts    # Service interface
├── Implementation/
│   └── FileSystemProviderImplementation.ts  # Live implementation
├── Error/
│   ├── FileSystemProviderError.ts           # Error classes
│   └── index.ts                             # Error exports
├── index.ts                        # Main exports
└── README.md                       # This file
```

## Integration with VSCode Browser Workbench

To integrate with the VSCode browser workbench:

1. Register the file system provider:

```typescript
// In workbench initialization
const fs = yield * FileSystemProviderTag;
vscode.workspace.registerFileSystemProvider("file", fs);
```

2. The workbench will automatically use this provider for all file operations.

## Future Enhancements

- **File Watching**: Implement `watch()` method for real-time file change
  notifications
- **Binary File Support**: Add specialized binary file read/write operations
- **Search**: Implement recursive file search functionality
- **Permissions**: Add more granular permission checking

## Verification Checklist

- [x] Read files from Mountain via Tauri IPC
- [x] List directory contents
- [x] Handle errors gracefully
- [x] Convert URIs to paths correctly
- [x] VSCode-like IFileSystemProvider interface
- [x] Effect-TS pattern integration
- [ ] File watching (stub implementation)
- [ ] Integration testing with browser workbench

## Related Documentation

- [Mountain IPC Handlers](https://github.com/CodeEditorLand/Wind/tree/Current/Mountain/Source/IPC/WindServiceHandlers.rs)
- [Wind IPC Service](https://github.com/CodeEditorLand/Wind/tree/Current/Effect/IPC.ts)
- [Effect-TS Services](https://effect.website/docs/guide/context)
- [Sky Browser Workbench](https://github.com/CodeEditorLand/Wind/tree/Current/Sky/Source/Workbench/Tauri.astro)
