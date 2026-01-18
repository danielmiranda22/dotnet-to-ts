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

    it('should extract nullable string property from class', () => {
      const csharpCode = `
        public class NullableDto
        {
            public string? Description { get; set; }
        }
      `;
      const result = parser.parse(csharpCode);
      expect(result?.properties).toHaveLength(1);
      expect(result?.properties[0]).toEqual({
        name: 'Description',
        type: 'string?',
      });
    });

    it('should extract nullable int property from class', () => {
      const parser = new CSharpParser();
      const csharpCode = `
        public class EmployeeDto
        {
            public int? Age { get; set; }
        }
      `;

      const result = parser.parse(csharpCode);

      expect(result?.properties[0]).toEqual({
        name: 'Age',
        type: 'int?',
      });
    });

    it('should extract nullable DateTime property', () => {
      const parser = new CSharpParser();
      const csharpCode = `
        public class OrderDto
        {
            public DateTime? CompletedAt { get; set; }
        }
      `;

      const result = parser.parse(csharpCode);

      expect(result?.properties[0]).toEqual({
        name: 'CompletedAt',
        type: 'DateTime?',
      });
    });

    it('should handle mixed nullable and non-nullable properties', () => {
      const parser = new CSharpParser();
      const csharpCode = `
        public class UserDto
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string? Email { get; set; }
            public int? Age { get; set; }
        }
      `;

      const result = parser.parse(csharpCode);

      expect(result?.properties).toHaveLength(4);
      expect(result?.properties[0]).toEqual({ name: 'Id', type: 'int' });
      expect(result?.properties[1]).toEqual({ name: 'Name', type: 'string' });
      expect(result?.properties[2]).toEqual({ name: 'Email', type: 'string?' });
      expect(result?.properties[3]).toEqual({ name: 'Age', type: 'int?' });
    });

    it('should extract nullable bool property', () => {
      const parser = new CSharpParser();
      const csharpCode = `
        public class SettingsDto
        {
            public bool? IsEnabled { get; set; }
        }
      `;

      const result = parser.parse(csharpCode);

      expect(result?.properties[0]).toEqual({
        name: 'IsEnabled',
        type: 'bool?',
      });
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

  describe('Complex ViewModels', () => {
    let parser: CSharpParser;

    beforeEach(() => {
      parser = new CSharpParser();
    });

    it('should extract nexted object properties', () => {
      const csharpCode = `
        public class OrderViewModel
        {
            public int OrderId { get; set; }
            public CustomerDto Customer { get; set; }
            public List<OrderItemDto> Items { get; set; }
        }
      `;
      const result = parser.parse(csharpCode);
      expect(result?.properties).toHaveLength(3);
      expect(result?.properties).toEqual([
        { name: 'OrderId', type: 'int' },
        { name: 'Customer', type: 'CustomerDto' },
        { name: 'Items', type: 'List<OrderItemDto>' },
      ]);
    });

    it('should parse complete EmployeeViewModel from fixture', () => {
      const filePath = path.join(__dirname, 'fixtures/EmployeeViewModel.cs');
      const csharpCode = fs.readFileSync(filePath, 'utf-8');

      const result = parser.parse(csharpCode);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('EmployeeViewModel');
      expect(result?.properties).toHaveLength(7);
      expect(result?.properties).toContainEqual({ name: 'Id', type: 'int' });
      expect(result?.properties).toContainEqual({
        name: 'Name',
        type: 'string',
      });
      expect(result?.properties).toContainEqual({
        name: 'IsActive',
        type: 'bool',
      });
      expect(result?.properties).toContainEqual({
        name: 'LastLogin',
        type: 'DateTime',
      });
      expect(result?.properties).toContainEqual({
        name: 'Department',
        type: 'DepartmentDto',
      });
      expect(result?.properties).toContainEqual({
        name: 'Roles',
        type: 'List<string>',
      });
    });

    it('should parse EntityDto from fixture', () => {
      const filePath = path.join(__dirname, 'fixtures/EntityDto.cs');
      const csharpCode = fs.readFileSync(filePath, 'utf-8');

      const result = parser.parse(csharpCode);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('EntityDto');
      expect(result?.properties).toHaveLength(3);
      expect(result?.properties).toContainEqual({ name: 'Id', type: 'int' });
      expect(result?.properties).toContainEqual({
        name: 'Name',
        type: 'string',
      });
      expect(result?.properties).toContainEqual({
        name: 'Code',
        type: 'string',
      });
    });
  });

  describe('Erro Handling', () => {
    let parser: CSharpParser;

    beforeEach(() => {
      parser = new CSharpParser();
    });

    it('should reurn null for completely invalid C# code', () => {
      const csharpCode = `This is not valid C# code!`;
      const result = parser.parse(csharpCode);
      expect(result).toBeNull();
    });

    it('should return null for empty string input', () => {
      const csharpCode = ``;
      const result = parser.parse(csharpCode);
      expect(result).toBeNull();
    });

    it('should handle class with missing closing brace', () => {
      const csharpCode = `
        public class IncompleteDto
        {
            public int Id { get; set; }
            public string Name { get; set; }
      `;
      const result = parser.parse(csharpCode);
      expect(result).not.toBeNull();
      expect(result?.name).toBe('IncompleteDto');
      expect(result?.properties).toHaveLength(2);
    });

    it('should ignore methods (not properties) in class', () => {
      const csharpCode = `
        public class MethodDto
        {
            public int Id { get; set; }

            public void DoSomething()
            {
                // method body
            }
        }
      `;
      const result = parser.parse(csharpCode);
      expect(result).not.toBeNull();
      expect(result?.name).toBe('MethodDto');
      expect(result?.properties).toHaveLength(1);
      expect(result?.properties[0]).toEqual({ name: 'Id', type: 'int' });
    });

    it('should ignore fields (not properties) in class', () => {
      const csharpCode = `
        public class FieldDto
        {
            public int Id; // field, not property
            public string Name { get; set; }
        }
      `;
      const result = parser.parse(csharpCode);
      expect(result).not.toBeNull();
      expect(result?.name).toBe('FieldDto');
      expect(result?.properties).toHaveLength(1);
      expect(result?.properties[0]).toEqual({ name: 'Name', type: 'string' });
    });

    it('should handle properties with attributes', () => {
      const csharpCode = `
        public class AttributeDto
        {
            [Required]
            public string Name { get; set; }
            
            [MaxLength(100)]
            [EmailAddress]
            public string Email { get; set; }
        }
      `;
      const result = parser.parse(csharpCode);
      expect(result).not.toBeNull();
      expect(result?.name).toBe('AttributeDto');
      expect(result?.properties).toHaveLength(2);
      expect(result?.properties).toContainEqual({
        name: 'Name',
        type: 'string',
      });
      expect(result?.properties).toContainEqual({
        name: 'Email',
        type: 'string',
      });
    });

    it('should handle properties with inline comments', () => {
      const csharpCode = `
        public class CommentDto
        {
            public int Id { get; set; } // This is the identifier
            public string Name { get; set; } /* This is the name */
        }
      `;
      const result = parser.parse(csharpCode);
      expect(result).not.toBeNull();
      expect(result?.name).toBe('CommentDto');
      expect(result?.properties).toHaveLength(2);
      expect(result?.properties).toContainEqual({ name: 'Id', type: 'int' });
      expect(result?.properties).toContainEqual({
        name: 'Name',
        type: 'string',
      });
    });
  });
});
