import { describe, it, expect, beforeEach } from 'vitest';
import { CSharpParser } from '../src/parser/CSharpParser';
import { TypeScriptGenerator } from '../src/generator/TypeScriptGenerator';
import * as fs from 'fs';
import * as path from 'path';

describe('Integration:  Parser → Generator Pipeline', () => {
  describe('End-to-end workflow', () => {
    let parser: CSharpParser;
    let generator: TypeScriptGenerator;

    beforeEach(() => {
      parser = new CSharpParser();
      generator = new TypeScriptGenerator({ addTimestamp: false });
    });

    it('should convert simple DTO from C# to TypeScript', () => {
      // Arrange
      const csharpCode = `
        public class UserDto
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string Email { get; set; }
        }
      `;

      // Act
      const parsed = parser.parse(csharpCode);
      expect(parsed).not.toBeNull();

      const tsCode = generator.generate(parsed!);

      // Assert
      expect(tsCode).toContain('export interface UserDto {');
      expect(tsCode).toContain('Id: number;');
      expect(tsCode).toContain('Name: string;');
      expect(tsCode).toContain('Email: string;');
      expect(tsCode).toContain('}');
    });

    it('should handle nullable types in full pipeline', () => {
      const csharpCode = `
        public class UserDto
        {
            public int Id { get; set; }
            public string?  Email { get; set; }
            public int? Age { get; set; }
        }
      `;

      // Act
      const parsed = parser.parse(csharpCode);
      const tsCode = generator.generate(parsed!);

      // Assert
      expect(tsCode).toContain('Id: number;');
      expect(tsCode).toContain('Email: string | null;');
      expect(tsCode).toContain('Age: number | null;');
    });

    it('should handle List types in full pipeline', () => {
      const csharpCode = `
        public class UserDto
        {
            public int Id { get; set; }
            public List<string> Roles { get; set; }
            public List<int> Scores { get; set; }
        }
      `;

      // Act
      const parsed = parser.parse(csharpCode);
      const tsCode = generator.generate(parsed!);

      // Assert
      expect(tsCode).toContain('Id: number;');
      expect(tsCode).toContain('Roles: string[];');
      expect(tsCode).toContain('Scores: number[];');
    });

    it('should handle custom types in full pipeline', () => {
      const csharpCode = `
        public class FuncionarioViewModel
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public EntityDto Entity { get; set; }
            public DepartmentDto Department { get; set; }
        }
      `;

      // Act
      const parsed = parser.parse(csharpCode);
      const tsCode = generator.generate(parsed!);

      // Assert
      expect(tsCode).toContain('export interface FuncionarioViewModel {');
      expect(tsCode).toContain('Id: number;');
      expect(tsCode).toContain('Name: string;');
      expect(tsCode).toContain('Entity: EntityDto;');
      expect(tsCode).toContain('Department: DepartmentDto;');
    });

    it('should handle complex nested types', () => {
      const csharpCode = `
        public class ComplexDto
        {
            public int Id { get; set; }
            public List<string?> Tags { get; set; }
            public Dictionary<string, int> Counts { get; set; }
            public DateTime? LastLogin { get; set; }
        }
      `;

      // Act
      const parsed = parser.parse(csharpCode);
      const tsCode = generator.generate(parsed!);

      // Assert
      expect(tsCode).toContain('Id: number;');
      expect(tsCode).toContain('Tags: (string | null)[]');
      expect(tsCode).toContain('Counts: Record<string, number>;');
      expect(tsCode).toContain('LastLogin: string | null;');
    });
  });

  describe('Real fixture files', () => {
    let parser: CSharpParser;
    let generator: TypeScriptGenerator;

    beforeEach(() => {
      parser = new CSharpParser();
      generator = new TypeScriptGenerator({ addTimestamp: false });
    });

    it('should convert EmployeeDto.cs to TypeScript', () => {
      const filePath = path.join(__dirname, 'fixtures/EmployeeDto.cs');
      const csharpCode = fs.readFileSync(filePath, 'utf-8');

      // Act
      const parsed = parser.parse(csharpCode);
      expect(parsed).not.toBeNull();
      expect(parsed?.name).toBe('EmployeeDto');

      const tsCode = generator.generate(parsed!);

      // Assert
      expect(tsCode).toContain('export interface EmployeeDto {');
      expect(tsCode).toContain('Id: number;');
      expect(tsCode).toContain('Name: string;');
      expect(tsCode).toContain('Email: string;');
      expect(tsCode).toContain('IsActive: boolean;');
      expect(tsCode).toContain('DepartmentId: number;');
      expect(tsCode).toContain('}');

      // Verify it's valid TypeScript structure
      const lines = tsCode.split('\n');
      expect(
        lines.some((line) => line.includes('export interface EmployeeDto')),
      ).toBe(true);
      expect(lines.some((line) => line.trim() === '}')).toBe(true);
    });

    it('should convert DepartmentDto.cs to TypeScript', () => {
      // Arrange
      const filePath = path.join(__dirname, 'fixtures/DepartmentDto.cs');
      const csharpCode = fs.readFileSync(filePath, 'utf-8');

      // Act
      const parsed = parser.parse(csharpCode);
      expect(parsed).not.toBeNull();

      const tsCode = generator.generate(parsed!);

      // Assert
      expect(tsCode).toContain('export interface DepartmentDto {');
      expect(tsCode).toContain('Id: number;');
      expect(tsCode).toContain('Name: string;');
      expect(tsCode).toContain('Location: string;');
    });

    it('should convert EmployeeViewModel.cs to TypeScript', () => {
      // Arrange
      const filePath = path.join(__dirname, 'fixtures/EmployeeViewModel.cs');
      const csharpCode = fs.readFileSync(filePath, 'utf-8');

      // Act
      const parsed = parser.parse(csharpCode);
      expect(parsed).not.toBeNull();

      const tsCode = generator.generate(parsed!);

      // Assert
      expect(tsCode).toContain('export interface EmployeeViewModel {');
      expect(tsCode).toContain('Id: number;');
      expect(tsCode).toContain('Name: string;');
      expect(tsCode).toContain('Entity: EntityDto;');
      expect(tsCode).toContain('Department: DepartmentDto;');
      expect(tsCode).toContain('Roles: string[];');
      expect(tsCode).toContain('LastLogin: string;');
      expect(tsCode).toContain('IsActive: boolean;');
    });

    it('should convert EntityDto.cs to TypeScript', () => {
      // Arrange
      const filePath = path.join(__dirname, 'fixtures/EntityDto.cs');
      const csharpCode = fs.readFileSync(filePath, 'utf-8');

      // Act
      const parsed = parser.parse(csharpCode);
      expect(parsed).not.toBeNull();

      const tsCode = generator.generate(parsed!);

      // Assert
      expect(tsCode).toContain('export interface EntityDto {');
      expect(tsCode).toContain('Id: number;');
      expect(tsCode).toContain('Name: string;');
      expect(tsCode).toContain('Code: string;');
    });
  });

  describe('Multiple files generation', () => {
    it('should generate multiple interfaces from multiple C# classes', () => {
      // Arrange
      const parser = new CSharpParser();
      const generator = new TypeScriptGenerator({ addTimestamp: false });

      const userCode = `
        public class UserDto {
            public int Id { get; set; }
            public string Name { get; set; }
        }
      `;

      const orderCode = `
        public class OrderDto {
            public int OrderId { get; set; }
            public decimal Total { get; set; }
        }
      `;

      // Act
      const user = parser.parse(userCode);
      const order = parser.parse(orderCode);

      expect(user).not.toBeNull();
      expect(order).not.toBeNull();

      const tsCode = generator.generateMultiple([user!, order!]);

      // Assert
      expect(tsCode).toContain('export interface UserDto {');
      expect(tsCode).toContain('Id: number;');
      expect(tsCode).toContain('Name: string;');

      expect(tsCode).toContain('export interface OrderDto {');
      expect(tsCode).toContain('OrderId: number;');
      expect(tsCode).toContain('Total: number;');

      // Verify they're separated
      const userIndex = tsCode.indexOf('interface UserDto');
      const orderIndex = tsCode.indexOf('interface OrderDto');
      expect(orderIndex).toBeGreaterThan(userIndex);
    });

    it('should generate all fixture files together', () => {
      // Arrange
      const parser = new CSharpParser();
      const generator = new TypeScriptGenerator({ addTimestamp: false });

      const files = ['EmployeeDto.cs', 'DepartmentDto.cs', 'EntityDto.cs'];

      const parsed = files
        .map((file) => {
          const filePath = path.join(__dirname, 'fixtures', file);
          const code = fs.readFileSync(filePath, 'utf-8');
          return parser.parse(code);
        })
        .filter((p) => p !== null);

      // Act
      const tsCode = generator.generateMultiple(parsed as any[]);

      // Assert
      expect(tsCode).toContain('export interface EmployeeDto {');
      expect(tsCode).toContain('export interface DepartmentDto {');
      expect(tsCode).toContain('export interface EntityDto {');

      // Verify proper separation
      const interfaces = tsCode.split('export interface');
      expect(interfaces.length).toBe(4); // Empty string + 3 interfaces
    });
  });

  describe('Generator options in pipeline', () => {
    it('should respect timestamp option', () => {
      // Arrange
      const parser = new CSharpParser();
      const genWithTimestamp = new TypeScriptGenerator({ addTimestamp: true });
      const genWithoutTimestamp = new TypeScriptGenerator({
        addTimestamp: false,
      });

      const csharpCode = `
        public class UserDto {
            public int Id { get; set; }
        }
      `;

      // Act
      const parsed = parser.parse(csharpCode);
      const withTimestamp = genWithTimestamp.generate(parsed!);
      const withoutTimestamp = genWithoutTimestamp.generate(parsed!);

      // Assert
      expect(withTimestamp).toContain('Auto-generated by dotnet-to-ts');
      expect(withTimestamp).toContain('Generated on: ');

      expect(withoutTimestamp).not.toContain('Auto-generated');
      expect(withoutTimestamp).not.toContain('Generated on:');
    });

    it('should respect export option', () => {
      // Arrange
      const parser = new CSharpParser();
      const genWithExport = new TypeScriptGenerator({ exportInterfaces: true });
      const genWithoutExport = new TypeScriptGenerator({
        exportInterfaces: false,
      });

      const csharpCode = `
        public class UserDto {
            public int Id { get; set; }
        }
      `;

      // Act
      const parsed = parser.parse(csharpCode);
      const withExport = genWithExport.generate(parsed!);
      const withoutExport = genWithoutExport.generate(parsed!);

      // Assert
      expect(withExport).toContain('export interface UserDto');
      expect(withoutExport).toContain('interface UserDto');
      expect(withoutExport).not.toContain('export interface');
    });

    it('should respect indentation option', () => {
      // Arrange
      const parser = new CSharpParser();
      const gen2Spaces = new TypeScriptGenerator({
        indentation: '  ',
        addTimestamp: false,
      });
      const gen4Spaces = new TypeScriptGenerator({
        indentation: '    ',
        addTimestamp: false,
      });

      const csharpCode = `
        public class UserDto {
            public int Id { get; set; }
        }
      `;

      // Act
      const parsed = parser.parse(csharpCode);
      const with2Spaces = gen2Spaces.generate(parsed!);
      const with4Spaces = gen4Spaces.generate(parsed!);

      // Assert
      expect(with2Spaces).toContain('  Id: number;'); // 2 spaces
      expect(with4Spaces).toContain('    Id: number;'); // 4 spaces
    });
  });
});
