/**
 * @module Test/fileOperationsDemo
 * @description
 * Demo script to test file operations integration between Wind and Mountain
 */

import { tauriFileService } from '../Source/Desktop/TauriFileService';

async function testFileOperations() {
    console.log('Testing file operations integration...');
    
    try {
        // Test file write
        console.log('1. Writing test file...');
        await tauriFileService.writeFile('/tmp/test-file.txt', 'Hello from Wind!');
        console.log('✓ File written successfully');
        
        // Test file read
        console.log('2. Reading test file...');
        const content = await tauriFileService.readFile('/tmp/test-file.txt');
        console.log('✓ File read successfully:', content);
        
        // Test file exists
        console.log('3. Checking if file exists...');
        const exists = await tauriFileService.exists('/tmp/test-file.txt');
        console.log('✓ File exists check:', exists);
        
        // Test file stat
        console.log('4. Getting file stats...');
        const stats = await tauriFileService.stat('/tmp/test-file.txt');
        console.log('✓ File stats:', stats);
        
        // Test directory creation
        console.log('5. Creating directory...');
        await tauriFileService.createDirectory('/tmp/test-dir');
        console.log('✓ Directory created successfully');
        
        // Test directory listing
        console.log('6. Listing directory contents...');
        const entries = await tauriFileService.readDirectory('/tmp');
        console.log('✓ Directory contents:', entries.length, 'entries');
        
        // Test file copy
        console.log('7. Copying file...');
        await tauriFileService.copy('/tmp/test-file.txt', '/tmp/test-file-copy.txt');
        console.log('✓ File copied successfully');
        
        // Test file move
        console.log('8. Moving file...');
        await tauriFileService.move('/tmp/test-file-copy.txt', '/tmp/test-dir/moved-file.txt');
        console.log('✓ File moved successfully');
        
        // Test file delete
        console.log('9. Deleting file...');
        await tauriFileService.delete('/tmp/test-file.txt');
        console.log('✓ File deleted successfully');
        
        console.log('✅ All file operations completed successfully!');
        
    } catch (error) {
        console.error('❌ File operation failed:', error);
    }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testFileOperations();
}

export { testFileOperations };
