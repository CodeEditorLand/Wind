/**
 * @module Test/verifyFileOperations
 * @description
 * Verification script to test file operations integration
 */

import { tauriFileService } from '../Source/Desktop/TauriFileService.js';

async function verifyFileOperations() {
    console.log('🔍 Verifying file operations integration...\n');
    
    const testResults = {
        total: 0,
        passed: 0,
        failed: 0
    };
    
    async function runTest(name: string, testFn: () => Promise<boolean>) {
        testResults.total++;
        try {
            const result = await testFn();
            if (result) {
                testResults.passed++;
                console.log(`✅ ${name}`);
            } else {
                testResults.failed++;
                console.log(`❌ ${name}`);
            }
        } catch (error) {
            testResults.failed++;
            console.log(`❌ ${name} - Error: ${error}`);
        }
    }
    
    // Test 1: Basic file operations
    await runTest('File write operation', async () => {
        try {
            await tauriFileService.writeFile('/tmp/verify-test.txt', 'Test content');
            return true;
        } catch {
            return false;
        }
    });
    
    // Test 2: File read operation
    await runTest('File read operation', async () => {
        try {
            const content = await tauriFileService.readFile('/tmp/verify-test.txt');
            return content === 'Test content';
        } catch {
            return false;
        }
    });
    
    // Test 3: File exists operation
    await runTest('File exists operation', async () => {
        try {
            const exists = await tauriFileService.exists('/tmp/verify-test.txt');
            return exists === true;
        } catch {
            return false;
        }
    });
    
    // Test 4: File stat operation
    await runTest('File stat operation', async () => {
        try {
            const stats = await tauriFileService.stat('/tmp/verify-test.txt');
            return stats && typeof stats.isDirectory === 'boolean';
        } catch {
            return false;
        }
    });
    
    // Test 5: Directory creation
    await runTest('Directory creation', async () => {
        try {
            await tauriFileService.createDirectory('/tmp/verify-dir');
            return true;
        } catch {
            return false;
        }
    });
    
    // Test 6: Directory listing
    await runTest('Directory listing', async () => {
        try {
            const entries = await tauriFileService.readDirectory('/tmp');
            return Array.isArray(entries);
        } catch {
            return false;
        }
    });
    
    // Test 7: File copy operation
    await runTest('File copy operation', async () => {
        try {
            await tauriFileService.copy('/tmp/verify-test.txt', '/tmp/verify-test-copy.txt');
            return true;
        } catch {
            return false;
        }
    });
    
    // Test 8: File move operation
    await runTest('File move operation', async () => {
        try {
            await tauriFileService.move('/tmp/verify-test-copy.txt', '/tmp/verify-dir/moved-file.txt');
            return true;
        } catch {
            return false;
        }
    });
    
    // Test 9: File delete operation
    await runTest('File delete operation', async () => {
        try {
            await tauriFileService.delete('/tmp/verify-test.txt');
            return true;
        } catch {
            return false;
        }
    });
    
    // Test 10: Binary file operations
    await runTest('Binary file operations', async () => {
        try {
            const binaryData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
            await tauriFileService.writeFileBinary('/tmp/verify-binary.bin', binaryData);
            const readData = await tauriFileService.readFileBinary('/tmp/verify-binary.bin');
            return readData.length === binaryData.length;
        } catch {
            return false;
        }
    });
    
    // Cleanup
    try {
        await tauriFileService.delete('/tmp/verify-dir');
        await tauriFileService.delete('/tmp/verify-binary.bin');
    } catch {
        // Ignore cleanup errors
    }
    
    console.log('\n📊 Test Results:');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    
    const successRate = (testResults.passed / testResults.total) * 100;
    console.log(`Success Rate: ${successRate.toFixed(1)}%`);
    
    if (testResults.failed === 0) {
        console.log('\n🎉 All file operations integration tests passed!');
        return true;
    } else {
        console.log('\n⚠️ Some file operations integration tests failed');
        return false;
    }
}

// Run verification if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    verifyFileOperations().then(success => {
        process.exit(success ? 0 : 1);
    });
}

export { verifyFileOperations };
