import { describe, expect, it, beforeEach } from 'vitest';
import { CSharpParser } from '../src/parser/CSharpParser.ts';
import path from 'path';
import fs from 'fs';

describe('CSharperParser', () => {
  describe('extractClassName', () => {
    let parser: CSharpParser;

    beforeEach(() => {
      parser = new CSharpParser();
    });

    it('should extract class name from simple class declaration', () => {
      //arrange
      const code = `public class MyClass { }`;
      //act
      const result = parser.parse(code);
      //assert
      expect(result).not.toBeNull();
      expect(result?.name).toBe('MyClass');
    });

    it('should extract class name with extra whitespace', () => {
      const csharpCode = 'public   class    EmployeeDto';
      const result = parser.parse(csharpCode);
      expect(result?.name).toBe('EmployeeDto');
    });

    it('should extract class name from class with properties', () => {
      const csharpCode = `
        public class UserDto
        {
            public int Id { get; set; }
            public string Name { get; set; }
        }
      `;
      const result = parser.parse(csharpCode);
      expect(result?.name).toBe('UserDto');
    });

    it('should return null for invalid C# code with no class', () => {
      const csharpCode = 'public interface ISomething';
      const result = parser.parse(csharpCode);
      expect(result).toBeNull();
    });

    it('should extract class name from multiline code', () => {
      const csharpCode = `
        namespace MyApp.Models
        {
            public class DepartmentDto
            {
                // properties here
            }
        }
      `;
      const result = parser.parse(csharpCode);
      expect(result?.name).toBe('DepartmentDto');
    });
  });

  describe('extractProperties', () => {
    let parser: CSharpParser;

    beforeEach(() => {
      parser = new CSharpParser();
    });

    it('should extract single property from class', () => {
      const csharpCode = `
        public class ProductDto
        {
            public int Id { get; set; }
        }
      `;
      const result = parser.parse(csharpCode);
      expect(result?.properties).toHaveLength(1);
      expect(result?.properties[0]).toEqual({ name: 'Id', type: 'int' });
    });

    it('should extract multiple properties from class', () => {
      const csharpCode = `
        public class OrderDto
        {
            public int OrderId { get; set; }
            public string CustomerName { get; set; }
            public DateTime OrderDate { get; set; }
        }
      `;
      const result = parser.parse(csharpCode);
      expect(result?.properties).toHaveLength(3);
      expect(result?.properties).toEqual([
        { name: 'OrderId', type: 'int' },
        { name: 'CustomerName', type: 'string' },
        { name: 'OrderDate', type: 'DateTime' },
      ]);
    });

    it('should extract branded properties from class', () => {
      const csharpCode = `
        public class CustomerDto
        {
            public Guid CustomerId { get; set; }
            public string FullName { get; set; }
            public string Email { get; set; }
        }
      `;
      const result = parser.parse(csharpCode);
      expect(result?.properties).toHaveLength(3);
      expect(result?.properties).toEqual([
        { name: 'CustomerId', type: 'Guid' },
        { name: 'FullName', type: 'string' },
        { name: 'Email', type: 'string' },
      ]);
    });

    it('should extract datetime property from class', () => {
      const csharpCode = `
        public class EventDto
        {
            public DateTime EventDate { get; set; }
        }
      `;
      const result = parser.parse(csharpCode);
      expect(result?.properties).toHaveLength(1);
      expect(result?.properties[0]).toEqual({
        name: 'EventDate',
        type: 'DateTime',
      });
    });

    it('should extract decimal property from class', () => {
      const csharpCode = `
        public class InvoiceDto
        {
            public decimal Amount { get; set; }
        }
      `;
      const result = parser.parse(csharpCode);
      expect(result?.properties).toHaveLength(1);
      expect(result?.properties[0]).toEqual({
        name: 'Amount',
        type: 'decimal',
      });
    });

    it('should return empty properties array for class with no properties', () => {
      const csharpCode = `
        public class EmptyDto
        {
        }
      `;
      const result = parser.parse(csharpCode);
      expect(result?.properties).toHaveLength(0);
      expect(result?.properties).toEqual([]);
    });

    it('should extract generic type property from class', () => {
      const csharpCode = `
        public class GenericDto
        {
            public List<string> Names { get; set; };
        }
      `;
      const result = parser.parse(csharpCode);
      expect(result?.properties).toHaveLength(1);
      expect(result?.properties[0]).toEqual({
        name: 'Names',
        type: 'List<string>',
      });
    });

    it('should handle mixed property types', () => {
      const csharpCode = `
        public class ComplexDto
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public bool IsActive { get; set; }
            public DateTime CreatedAt { get; set; }
            public decimal Amount { get; set; }
            public List<string> Names { get; set; }
        }`;

      const result = parser.parse(csharpCode);

      expect(result?.properties).toHaveLength(6);
      expect(result?.properties[0].type).toBe('int');
      expect(result?.properties[1].type).toBe('string');
      expect(result?.properties[2].type).toBe('bool');
      expect(result?.properties[3].type).toBe('DateTime');
      expect(result?.properties[4].type).toBe('decimal');
      expect(result?.properties[5].type).toBe('List<string>');
    });
  });

  describe('Real fixture files', () => {
    let parser: CSharpParser;
    let csharpCode: string;

    beforeEach(() => {
      parser = new CSharpParser();
      const filePath = path.join(__dirname, 'fixtures/EmployeeDto.cs');
      csharpCode = fs.readFileSync(filePath, 'utf-8');
    });

    it('should parse EmployeeDto.cs fixture correctly', () => {
      const result = parser.parse(csharpCode);
      expect(result).not.toBeNull();
      expect(result?.name).toBe('EmployeeDto');
      expect(result?.properties).toHaveLength(5);
      expect(result?.properties).toEqual([
        { name: 'Id', type: 'int' },
        { name: 'Name', type: 'string' },
        { name: 'Email', type: 'string' },
        { name: 'IsActive', type: 'bool' },
        { name: 'DepartmentId', type: 'int' },
      ]);
    });

    it('should parse DepartmentDto.cs fixture', () => {
      const parser = new CSharpParser();
      const filePath = path.join(__dirname, 'fixtures/DepartmentDto.cs');
      const csharpCode = fs.readFileSync(filePath, 'utf-8');

      const result = parser.parse(csharpCode);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('DepartmentDto');
      expect(result?.properties).toHaveLength(3);
      expect(result?.properties).toContainEqual({ name: 'Id', type: 'int' });
      expect(result?.properties).toContainEqual({
        name: 'Name',
        type: 'string',
      });
      expect(result?.properties).toContainEqual({
        name: 'Location',
        type: 'string',
      });
    });
  });
});
