// Mock implementations for Microsoft VSCode dependencies

export class URI {
  static parse(value: string): URI {
    return new URI();
  }
  
  static file(path: string): URI {
    return new URI();
  }
  
  static revive(obj: any): URI {
    return new URI();
  }
  
  static from(obj: any): URI {
    return new URI();
  }
  
  scheme?: string;
}

export class Disposable {
  dispose(): void {}
  
  _register<T extends IDisposable>(disposable: T): T {
    return disposable;
  }
}

export class ServiceCollection {
  set<T>(serviceId: any, instance: T): void {}
}

export interface IMainProcessService {
  // Mock interface
}

export interface INativeWorkbenchEnvironmentService {
  // Mock interface
}

export interface IWorkspaceContextService {
  // Mock interface
}

export interface INativeHostService {
  // Mock interface
}

export interface IFileService {
  // Mock interface
}

export class Workbench {
  onWillShutdown(callback: (event: any) => void): IDisposable {
    return { dispose: () => {} };
  }
  onDidShutdown(callback: () => void): IDisposable {
    return { dispose: () => {} };
  }
}

export interface IProductService {
  // Mock interface
}

export interface IConfigurationService {
  // Mock interface
}

export interface IStorageService {
  // Mock interface
}

export interface ILogService {
  // Mock interface
}

export interface IDisposable {
  dispose(): void;
}
