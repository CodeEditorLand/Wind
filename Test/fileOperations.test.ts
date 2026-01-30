/**
 * @module Test/fileOperations
 * @description
 * Test file operations integration between Wind and Mountain
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tauriFileService } from '../Source/Desktop/TauriFileService';

// Mock Tauri invoke function
const mockInvoke = vi.fn();

// Mock Tauri global
const mockTauri = {
  invoke: mockInvoke
};

// Setup mock before each test
beforeEach(() => {
  (globalThis as any).__TAURI__ = mockTauri;
});

// Cleanup after each test
afterEach(() => {
  (globalThis as any).__TAURI__ = undefined;
  mockInvoke.mockClear();
});

describe('File Operations Integration', () => {
  describe('TauriFileService', () => {
    it('should check if file exists', async () => {
      mockInvoke.mockResolvedValue(true);
      
      const exists = await tauriFileService.exists('/test/file.txt');
      
      expect(mockInvoke).toHaveBeenCalledWith('mountain_ipc_invoke', {
        command: 'file:exists',
        args: ['/test/file.txt']
      });
      expect(exists).toBe(true);
    });

    it('should read file as text', async () => {
      mockInvoke.mockResolvedValue('file content');
      
      const content = await tauriFileService.readFile('/test/file.txt');
      
      expect(mockInvoke).toHaveBeenCalledWith('mountain_ipc_invoke', {
        command: 'file:read',
        args: ['/test/file.txt']
      });
      expect(content).toBe('file content');
    });

    it('should write file', async () => {
      mockInvoke.mockResolvedValue(null);
      
      await tauriFileService.writeFile('/test/file.txt', 'file content');
      
      expect(mockInvoke).toHaveBeenCalledWith('mountain_ipc_invoke', {
        command: 'file:write',
        args: ['/test/file.txt', 'file content']
      });
    });

    it('should get file stats', async () => {
      mockInvoke.mockResolvedValue({
        isDirectory: false,
        size: 1024,
        modified: 1234567890
      });
      
      const stats = await tauriFileService.stat('/test/file.txt');
      
      expect(mockInvoke).toHaveBeenCalledWith('mountain_ipc_invoke', {
        command: 'file:stat',
        args: ['/test/file.txt']
      });
      expect(stats.path).toBe('/test/file.txt');
      expect(stats.isDirectory).toBe(false);
      expect(stats.size).toBe(1024);
    });

    it('should create directory', async () => {
      mockInvoke.mockResolvedValue(null);
      
      await tauriFileService.createDirectory('/test/dir', true);
      
      expect(mockInvoke).toHaveBeenCalledWith('mountain_ipc_invoke', {
        command: 'file:mkdir',
        args: ['/test/dir', true]
      });
    });

    it('should delete file', async () => {
      mockInvoke.mockResolvedValue(null);
      
      await tauriFileService.delete('/test/file.txt');
      
      expect(mockInvoke).toHaveBeenCalledWith('mountain_ipc_invoke', {
        command: 'file:delete',
        args: ['/test/file.txt']
      });
    });

    it('should copy file', async () => {
      mockInvoke.mockResolvedValue(null);
      
      await tauriFileService.copy('/test/source.txt', '/test/destination.txt');
      
      expect(mockInvoke).toHaveBeenCalledWith('mountain_ipc_invoke', {
        command: 'file:copy',
        args: ['/test/source.txt', '/test/destination.txt']
      });
    });

    it('should move file', async () => {
      mockInvoke.mockResolvedValue(null);
      
      await tauriFileService.move('/test/source.txt', '/test/destination.txt');
      
      expect(mockInvoke).toHaveBeenCalledWith('mountain_ipc_invoke', {
        command: 'file:move',
        args: ['/test/source.txt', '/test/destination.txt']
      });
    });

    it('should read directory', async () => {
      mockInvoke.mockResolvedValue([
        { path: '/test/file1.txt', name: 'file1.txt', isDirectory: false, size: 100, modified: 1234567890 },
        { path: '/test/dir', name: 'dir', isDirectory: true, size: 0, modified: 1234567890 }
      ]);
      
      const entries = await tauriFileService.readDirectory('/test');
      
      expect(mockInvoke).toHaveBeenCalledWith('mountain_ipc_invoke', {
        command: 'file:readdir',
        args: ['/test']
      });
      expect(entries).toHaveLength(2);
      expect(entries[0].name).toBe('file1.txt');
      expect(entries[1].name).toBe('dir');
    });

    it('should handle errors gracefully', async () => {
      mockInvoke.mockRejectedValue(new Error('File not found'));
      
      await expect(tauriFileService.readFile('/test/nonexistent.txt')).rejects.toThrow('Failed to read file: /test/nonexistent.txt');
    });
  });
});
