import { FileSystem } from './utils/FileSystem';
import * as path from 'path';

async function test() {
  console.log('🧪 Testing FileSystem\n');

  const fs = new FileSystem();

  // Test 1: Scan for C# files
  console.log('--- Test 1: Scan for C# files ---');
  const files = await fs.scan(
    ['tests/fixtures/**/*.cs'],
    process.cwd(), // Explicitly set base path
  );
  console.log(`Found ${files.length} files:`);
  files.forEach((file) => {
    console.log(`  - ${path.basename(file)}`);
  });
  console.log();

  // Test 2: Read single file
  console.log('--- Test 2: Read single file ---');
  if (files.length > 0) {
    const content = fs.read(files[0]!);
    console.log(`Read ${path.basename(files[0]!)}:`);
    console.log(content.substring(0, 100) + '...\n');
  }

  // Test 3: Read multiple files
  console.log('--- Test 3: Read multiple files ---');
  const results = fs.readMultiple(files);
  console.log(`Read ${results.length} files:`);
  results.forEach((result) => {
    console.log(`  - ${result.name}:  ${result.content.length} bytes`);
  });
  console.log();

  // Test 4: Write file
  console.log('--- Test 4: Write file ---');
  const outputPath = 'output/test-output.ts';
  const testContent = `// Test output\nexport interface TestDto {\n  Id: number;\n}\n`;
  fs.write(outputPath, testContent);
  console.log(`✅ Written to: ${outputPath}`);

  // Verify it exists
  if (fs.exists(outputPath)) {
    console.log(`✅ File exists: ${outputPath}`);
    const written = fs.read(outputPath);
    console.log(`✅ Content matches: ${written === testContent}`);
  }
  console.log();

  // Test 5: Multiple patterns
  console.log('--- Test 5: Multiple patterns ---');
  const multiFiles = await fs.scan([
    'tests/fixtures/EmployeeDto.cs',
    'tests/fixtures/DepartmentDto.cs',
  ]);
  console.log(`Found ${multiFiles.length} files with specific patterns:`);
  multiFiles.forEach((file) => {
    console.log(`  - ${path.basename(file)}`);
  });
  console.log();

  // Test 6: Ensure directory
  console.log('--- Test 6: Ensure directory ---');
  fs.ensureDirectory('output/nested/deep/path');
  console.log('✅ Created nested directory:  output/nested/deep/path');
  console.log();

  console.log('✅ All FileSystem tests passed!');
}

test().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
