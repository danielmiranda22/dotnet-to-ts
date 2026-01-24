import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileSystem } from '../src/utils/FileSystem.js';
import * as fs from 'fs';
import * as path from 'path';

describe('FileSystem', () => {
  let fileSystem = new FileSystem();
  const testDir = path.join(__dirname, 'tem-fs-test');

  beforeEach(() => {
    // Create a temporary test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }
  });

  afterEach(() => {
    // Clean up the test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('scan()', () => {
    it('should find C# files in fixtures directory', async () => {
      // Act
      const files = await fileSystem.scan(['tests/fixtures/**/*.cs']);

      // Assert
      expect(files.length).toBeGreaterThan(0);
      expect(files.every((f) => f.endsWith('.cs'))).toBe(true);

      // Should find our test fixtures
      const fileNames = files.map((f) => path.basename(f));
      expect(fileNames).toContain('EmployeeDto.cs');
      expect(fileNames).toContain('DepartmentDto.cs');
    });

    it('should find files with multiple patterns', async () => {
      // Act
      const files = await fileSystem.scan([
        'tests/fixtures/EmployeeDto.cs',
        'tests/fixtures/DepartmentDto.cs',
      ]);

      // Assert
      expect(files.length).toBe(2);
      expect(files.some((f) => f.includes('EmployeeDto.cs'))).toBe(true);
      expect(files.some((f) => f.includes('DepartmentDto.cs'))).toBe(true);
    });

    it('should return empty array when no files match pattern', async () => {
      // Act
      const files = await fileSystem.scan(['tests/fixtures/**/*.nonexistent']);

      // Assert
      expect(files).toEqual([]);
    });

    it('should return sorted file paths', async () => {
      // Act
      const files = await fileSystem.scan(['tests/fixtures/**/*.cs']);

      // Assert
      expect(files.length).toBeGreaterThan(1);

      // Check if sorted
      const sorted = [...files].sort();
      expect(files).toEqual(sorted);
    });

    it('should remove duplicate files from multiple patterns', async () => {
      // Act
      const files = await fileSystem.scan([
        'tests/fixtures/**/*.cs',
        'tests/fixtures/EmployeeDto.cs', // Duplicate
      ]);

      // Assert
      const employeeFiles = files.filter((f) => f.includes('EmployeeDto.cs'));
      expect(employeeFiles.length).toBe(1); // Should appear only once
    });

    it('should handle absolute paths', async () => {
      // Arrange
      const absolutePattern = path.join(
        process.cwd(),
        'tests',
        'fixtures',
        '*.cs',
      );

      // Act
      const files = await fileSystem.scan([absolutePattern]);

      // Assert
      expect(files.length).toBeGreaterThan(0);
      expect(files.every((f) => path.isAbsolute(f))).toBe(true);
    });
  });

  describe('read()', () => {
    it('should read file content', async () => {
      // Arrange
      const files = await fileSystem.scan(['tests/fixtures/EmployeeDto.cs']);
      expect(files.length).toBeGreaterThan(0);

      // Act
      const content = fileSystem.read(files[0]);

      // Assert
      expect(content).toBeTruthy();
      expect(content).toContain('class EmployeeDto');
      expect(content).toContain('public');
    });

    it('should throw error when file does not exist', () => {
      // Arrange
      const nonExistentFile = path.join(testDir, 'missing.cs');

      // Act & Assert
      expect(() => fileSystem.read(nonExistentFile)).toThrow('File not found');
    });

    it('should read file with UTF-8 encoding', async () => {
      // Arrange
      const testFile = path.join(testDir, 'utf8-test.cs');
      const content = 'public class TestDto { /* Comment with émojis 🎉 */ }';
      fs.writeFileSync(testFile, content, 'utf-8');

      // Act
      const result = fileSystem.read(testFile);

      // Assert
      expect(result).toBe(content);
    });
  });
  describe('readMultiple()', () => {
    it('should read multiple files', async () => {
      // Arrange
      const files = await fileSystem.scan(['tests/fixtures/**/*.cs']);
      expect(files.length).toBeGreaterThan(0);

      // Act
      const results = fileSystem.readMultiple(files);

      // Assert
      expect(results.length).toBe(files.length);

      results.forEach((result, index) => {
        expect(result.path).toBe(files[index]);
        expect(result.name).toBe(path.basename(files[index]));
        expect(result.content).toBeTruthy();
        expect(result.content.length).toBeGreaterThan(0);
      });
    });

    it('should include file metadata in results', async () => {
      // Arrange
      const files = await fileSystem.scan(['tests/fixtures/EmployeeDto.cs']);

      // Act
      const results = fileSystem.readMultiple(files);

      // Assert
      expect(results.length).toBe(1);
      expect(results[0].path).toContain('EmployeeDto.cs');
      expect(results[0].name).toBe('EmployeeDto.cs');
      expect(results[0].content).toContain('class EmployeeDto');
    });

    it('should handle empty file list', () => {
      // Act
      const results = fileSystem.readMultiple([]);

      // Assert
      expect(results).toEqual([]);
    });
  });

  describe('write()', () => {
    it('should write content to file', () => {
      // Arrange
      const filePath = path.join(testDir, 'output.ts');
      const content = 'export interface TestDto { Id: number; }';

      // Act
      fileSystem.write(filePath, content);

      // Assert
      expect(fs.existsSync(filePath)).toBe(true);
      const written = fs.readFileSync(filePath, 'utf-8');
      expect(written).toBe(content);
    });

    it('should create directories if they do not exist', () => {
      // Arrange
      const filePath = path.join(testDir, 'nested', 'deep', 'output.ts');
      const content = 'export interface TestDto {}';

      // Act
      fileSystem.write(filePath, content);

      // Assert
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'nested'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'nested', 'deep'))).toBe(true);
    });

    it('should overwrite existing file', () => {
      // Arrange
      const filePath = path.join(testDir, 'overwrite.ts');
      const originalContent = 'original';
      const newContent = 'new content';

      fs.writeFileSync(filePath, originalContent);
      expect(fs.readFileSync(filePath, 'utf-8')).toBe(originalContent);

      // Act
      fileSystem.write(filePath, newContent);

      // Assert
      expect(fs.readFileSync(filePath, 'utf-8')).toBe(newContent);
    });
  });

  describe('exists()', () => {
    it('should return true for existing file', async () => {
      // Arrange
      const files = await fileSystem.scan(['tests/fixtures/EmployeeDto.cs']);
      expect(files.length).toBeGreaterThan(0);

      // Act & Assert
      expect(fileSystem.exists(files[0])).toBe(true);
    });

    it('should return false for non-existent file', () => {
      // Arrange
      const nonExistentFile = path.join(testDir, 'does-not-exist.cs');

      // Act & Assert
      expect(fileSystem.exists(nonExistentFile)).toBe(false);
    });

    it('should return true for existing directory', () => {
      // Arrange
      const dir = path.join(testDir, 'test-exists-dir');
      fs.mkdirSync(dir);

      // Act & Assert
      expect(fileSystem.exists(dir)).toBe(true);
    });
  });

  describe('ensureDirectory()', () => {
    it('should create directory if it does not exist', () => {
      // Arrange
      const dir = path.join(testDir, 'new-directory');
      expect(fs.existsSync(dir)).toBe(false);

      // Act
      fileSystem.ensureDirectory(dir);

      // Assert
      expect(fs.existsSync(dir)).toBe(true);
      expect(fs.statSync(dir).isDirectory()).toBe(true);
    });

    it('should create nested directories', () => {
      // Arrange
      const dir = path.join(testDir, 'level1', 'level2', 'level3');
      expect(fs.existsSync(dir)).toBe(false);

      // Act
      fileSystem.ensureDirectory(dir);

      // Assert
      expect(fs.existsSync(dir)).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'level1'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'level1', 'level2'))).toBe(true);
    });

    it('should not throw error if directory already exists', () => {
      // Arrange
      const dir = path.join(testDir, 'existing-dir');
      fs.mkdirSync(dir);

      // Act & Assert - Should not throw
      expect(() => fileSystem.ensureDirectory(dir)).not.toThrow();
      expect(fs.existsSync(dir)).toBe(true);
    });
  });

  describe('Integration with real fixtures', () => {
    it('should scan and read all fixture files', async () => {
      // Act
      const files = await fileSystem.scan(['tests/fixtures/**/*.cs']);
      const results = fileSystem.readMultiple(files);

      // Assert
      expect(results.length).toBeGreaterThan(0);

      // Check we have expected fixtures
      const fileNames = results.map((r) => r.name);
      expect(fileNames).toContain('EmployeeDto.cs');
      expect(fileNames).toContain('DepartmentDto.cs');
      expect(fileNames).toContain('EntityDto.cs');
      expect(fileNames).toContain('EmployeeViewModel.cs');

      // Verify all have content
      results.forEach((result) => {
        expect(result.content.length).toBeGreaterThan(0);
        expect(result.content).toContain('class');
      });
    });

    it('should write generated output to file', async () => {
      // Arrange
      const outputPath = path.join(testDir, 'generated.ts');
      const content = `export interface EmployeeDto {
        Id:  number;
        Name: string;
      }`;

      // Act
      fileSystem.write(outputPath, content);

      // Assert
      expect(fileSystem.exists(outputPath)).toBe(true);
      const written = fileSystem.read(outputPath);
      expect(written).toBe(content);
    });
  });
});
