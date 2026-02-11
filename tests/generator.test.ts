import { describe, it, expect, beforeEach } from 'vitest';
import { TSGenerator } from '../src/generator/TSGenerator.js';
import { ParsedClass } from '../src/parser/CSharpParser.js';

describe('TSGenerator', () => {
  let generator: TSGenerator;
  beforeEach(() => {
    generator = new TSGenerator();
  });

  describe('Basic interface generation', () => {
    it('should generate simple interface with one property', () => {
      const parsed: ParsedClass = {
        name: 'EmployeeDto',
        properties: [{ name: 'Id', type: 'int' }],
      };

      const result = generator.generate(parsed);

      expect(result).toContain('interface EmployeeDto {');
      expect(result).toContain('Id: number;');
      expect(result).toContain('}');
    });

    it('should generate interface with multiple properties', () => {
      const parsed: ParsedClass = {
        name: 'EmployeeDto',
        properties: [
          { name: 'Id', type: 'int' },
          { name: 'Name', type: 'string' },
          { name: 'Email', type: 'string' },
        ],
      };

      const result = generator.generate(parsed);

      expect(result).toContain('interface EmployeeDto {');
      expect(result).toContain('Id: number;');
      expect(result).toContain('Name: string;');
      expect(result).toContain('Email: string;');
    });

    it('should map C# types to TypeScript types correctly', () => {
      const parsed: ParsedClass = {
        name: 'TestDto',
        properties: [
          { name: 'IntProp', type: 'int' },
          { name: 'StringProp', type: 'string' },
          { name: 'BoolProp', type: 'bool' },
          { name: 'DateProp', type: 'DateTime' },
          { name: 'GuidProp', type: 'Guid' },
        ],
      };

      const result = generator.generate(parsed);

      expect(result).toContain('IntProp: number;');
      expect(result).toContain('StringProp: string;');
      expect(result).toContain('BoolProp: boolean;');
      expect(result).toContain('DateProp: string;');
      expect(result).toContain('GuidProp: string;');
    });

    it('should handle nullable types', () => {
      const parsed: ParsedClass = {
        name: 'UserDto',
        properties: [
          { name: 'Id', type: 'int' },
          { name: 'Email', type: 'string?' },
          { name: 'Age', type: 'int?' },
        ],
      };

      const result = generator.generate(parsed);

      expect(result).toContain('Id: number;');
      expect(result).toContain('Email: string | null;');
      expect(result).toContain('Age: number | null;');
    });

    it('should handle List types', () => {
      const parsed: ParsedClass = {
        name: 'UserDto',
        properties: [
          { name: 'Roles', type: 'List<string>' },
          { name: 'Scores', type: 'List<int>' },
        ],
      };

      const result = generator.generate(parsed);

      expect(result).toContain('Roles: string[];');
      expect(result).toContain('Scores: number[];');
    });

    it('should handle custom types', () => {
      const parsed: ParsedClass = {
        name: 'FuncionarioViewModel',
        properties: [
          { name: 'Entity', type: 'EntityDto' },
          { name: 'Department', type: 'DepartmentDto' },
        ],
      };

      const result = generator.generate(parsed);

      expect(result).toContain('Entity: EntityDto;');
      expect(result).toContain('Department: DepartmentDto;');
    });

    it('should handle empty class', () => {
      const parsed: ParsedClass = {
        name: 'EmptyDto',
        properties: [],
      };

      const result = generator.generate(parsed);

      expect(result).toContain('interface EmptyDto {');
      expect(result).toContain('// No properties');
      expect(result).toContain('}');
    });

    it('should handle property with undefined type', () => {
      const parsed: ParsedClass = {
        name: 'UndefinedTypeDto',
        properties: [{ name: 'UnknownProp', type: undefined }],
      };

      const result = generator.generate(parsed);

      expect(result).toContain('UnknownProp: any;');
    });
  });

  describe('Options - Export keyword', () => {
    it('should add export keyword by default', () => {
      const parsed: ParsedClass = {
        name: 'UserDto',
        properties: [{ name: 'Id', type: 'int' }],
      };

      const result = generator.generate(parsed);

      expect(result).toContain('export interface UserDto {');
    });

    it('should omit export keyword when exportInterfaces is false', () => {
      const gen = new TSGenerator({ exportInterfaces: false });
      const parsed: ParsedClass = {
        name: 'UserDto',
        properties: [{ name: 'Id', type: 'int' }],
      };

      const result = gen.generate(parsed);

      expect(result).toContain('interface UserDto {');
      expect(result).not.toContain('export interface');
    });
  });

  describe('Options - Timestamp', () => {
    it('should add timestamp comment by default', () => {
      const parsed: ParsedClass = {
        name: 'UserDto',
        properties: [{ name: 'Id', type: 'int' }],
      };

      const result = generator.generate(parsed);

      expect(result).toContain('Auto-generated by dotnet-to-ts');
      expect(result).toContain('Generated on: ');
      expect(result).toContain('DO NOT EDIT MANUALLY');
    });

    it('should omit timestamp when addTimestamp is false', () => {
      const gen = new TSGenerator({ addTimestamp: false });
      const parsed: ParsedClass = {
        name: 'UserDto',
        properties: [{ name: 'Id', type: 'int' }],
      };

      const result = gen.generate(parsed);

      expect(result).not.toContain('Auto-generated');
      expect(result).not.toContain('Generated on:');
      expect(result).toContain('interface UserDto {');
    });
  });

  describe('Options - Indentation', () => {
    it('should use 2 spaces by default', () => {
      const parsed: ParsedClass = {
        name: 'UserDto',
        properties: [{ name: 'Id', type: 'int' }],
      };

      const result = generator.generate(parsed);

      expect(result).toContain('  Id: number;'); // 2 spaces
    });

    it('should use 4 spaces when specified', () => {
      const gen = new TSGenerator({ indentation: '    ' });
      const parsed: ParsedClass = {
        name: 'UserDto',
        properties: [{ name: 'Id', type: 'int' }],
      };

      const result = gen.generate(parsed);

      expect(result).toContain('    Id: number;'); // 4 spaces
    });

    it('should use tabs when specified', () => {
      const gen = new TSGenerator({ indentation: '\t' });
      const parsed: ParsedClass = {
        name: 'UserDto',
        properties: [{ name: 'Id', type: 'int' }],
      };

      const result = gen.generate(parsed);

      expect(result).toContain('\tId: number;'); // tab
    });
  });

  describe('PropertyNameConventions', () => {
    it('should preserve property names by default', () => {
      const parsed: ParsedClass = {
        name: 'UserDto',
        properties: [{ name: 'FirstName', type: 'string' }],
      };

      const result = generator.generate(parsed);
      expect(result).toContain('FirstName: string;');
    });

    it('should convert property names to camelCase', () => {
      const gen = new TSGenerator({ propertyNamingConvention: 'camelCase' });
      const parsed: ParsedClass = {
        name: 'UserDto',
        properties: [{ name: 'FirstName', type: 'string' }],
      };

      const result = gen.generate(parsed);
      expect(result).toContain('firstName: string;');
    });

    it('should convert property names to PascalCase', () => {
      const gen = new TSGenerator({ propertyNamingConvention: 'PascalCase' });
      const parsed: ParsedClass = {
        name: 'UserDto',
        properties: [{ name: 'firstName', type: 'string' }],
      };

      const result = gen.generate(parsed);
      expect(result).toContain('FirstName: string;');
    });
  });

  describe('generateMultiple()', () => {
    it('should generate multiple interfaces', () => {
      const parsed1: ParsedClass = {
        name: 'UserDto',
        properties: [{ name: 'Id', type: 'int' }],
      };

      const parsed2: ParsedClass = {
        name: 'OrderDto',
        properties: [{ name: 'OrderId', type: 'int' }],
      };

      const result = generator.generateMultiple([parsed1, parsed2]);

      expect(result).toContain('interface UserDto {');
      expect(result).toContain('Id: number;');
      expect(result).toContain('interface OrderDto {');
      expect(result).toContain('OrderId: number;');
    });

    it('should separate interfaces with double newline', () => {
      const parsed1: ParsedClass = {
        name: 'UserDto',
        properties: [{ name: 'Id', type: 'int' }],
      };

      const parsed2: ParsedClass = {
        name: 'OrderDto',
        properties: [{ name: 'OrderId', type: 'int' }],
      };

      const result = generator.generateMultiple([parsed1, parsed2]);

      // Check for double newline between interfaces
      expect(result).toMatch(/}\s*\n\s*\n\s*\/\*\*/); // } \n\n /**
    });
  });

  describe('Edge cases', () => {
    it('should handle complex nested types', () => {
      const parsed: ParsedClass = {
        name: 'ComplexDto',
        properties: [
          { name: 'Items', type: 'List<string?>' },
          { name: 'Data', type: 'Dictionary<string, int>' },
        ],
      };

      const result = generator.generate(parsed);

      expect(result).toContain('Items: (string | null)[];');
      expect(result).toContain('Data: Record<string, number>;');
    });

    it('should handle properties with special names', () => {
      const parsed: ParsedClass = {
        name: 'SpecialDto',
        properties: [
          { name: 'IsActive', type: 'bool' },
          { name: 'HasPermission', type: 'bool' },
          { name: 'CanEdit', type: 'bool' },
        ],
      };

      const result = generator.generate(parsed);

      expect(result).toContain('IsActive: boolean;');
      expect(result).toContain('HasPermission: boolean;');
      expect(result).toContain('CanEdit: boolean;');
    });
  });
});
