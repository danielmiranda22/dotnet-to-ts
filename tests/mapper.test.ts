import { describe, it, expect, beforeEach } from 'vitest';
import { TypeMapper } from '../src/mapper/TypeMapper.js';

describe('TypeMapper', () => {
  let mapper: TypeMapper;

  beforeEach(() => {
    mapper = new TypeMapper();
  });

  describe('Basic types', () => {
    it('should map int to number', () => {
      const result = mapper.map('int');
      expect(result).toBe('number');
    });

    it('should map long to number', () => {
      const result = mapper.map('long');
      expect(result).toBe('number');
    });

    it('should map short to number', () => {
      const result = mapper.map('short');
      expect(result).toBe('number');
    });

    it('should map byte to number', () => {
      const result = mapper.map('byte');
      expect(result).toBe('number');
    });

    it('should map float to number', () => {
      const result = mapper.map('float');
      expect(result).toBe('number');
    });

    it('should map double to number', () => {
      const result = mapper.map('double');
      expect(result).toBe('number');
    });

    it('should map decimal to number', () => {
      const result = mapper.map('decimal');
      expect(result).toBe('number');
    });

    it('should map bool to boolean', () => {
      const result = mapper.map('bool');
      expect(result).toBe('boolean');
    });

    it('should map boolean to boolean', () => {
      const result = mapper.map('boolean');
      expect(result).toBe('boolean');
    });

    it('should map string to string', () => {
      const result = mapper.map('string');
      expect(result).toBe('string');
    });

    it('should map char to string', () => {
      const result = mapper.map('char');
      expect(result).toBe('string');
    });

    it('should map DateTime to string', () => {
      const result = mapper.map('DateTime');
      expect(result).toBe('string');
    });

    it('should map DateTimeOffset to string', () => {
      const result = mapper.map('DateTimeOffset');
      expect(result).toBe('string');
    });

    it('should map Guid to string', () => {
      const result = mapper.map('Guid');
      expect(result).toBe('string');
    });

    it('should map object to any', () => {
      const result = mapper.map('object');
      expect(result).toBe('any');
    });

    it('should map dynamic to any', () => {
      const result = mapper.map('dynamic');
      expect(result).toBe('any');
    });

    it('should map void to void', () => {
      const result = mapper.map('void');
      expect(result).toBe('void');
    });
  });

  describe('Nullable types', () => {
    it('should map string? to string | null', () => {
      const result = mapper.map('string?');
      expect(result).toBe('string | null');
    });

    it('should map int? to number | null', () => {
      const result = mapper.map('int?');
      expect(result).toBe('number | null');
    });

    it('should map bool? to boolean | null', () => {
      const result = mapper.map('bool?');
      expect(result).toBe('boolean | null');
    });

    it('should map DateTime? to string | null', () => {
      const result = mapper.map('DateTime?');
      expect(result).toBe('string | null');
    });

    it('should map Guid? to string | null', () => {
      const result = mapper.map('Guid?');
      expect(result).toBe('string | null');
    });

    it('should map decimal? to number | null', () => {
      const result = mapper.map('decimal?');
      expect(result).toBe('number | null');
    });

    it('should map long? to number | null', () => {
      const result = mapper.map('long?');
      expect(result).toBe('number | null');
    });
  });

  describe('Lists and Arrays', () => {
    it('should map List<string> to string[]', () => {
      const result = mapper.map('List<string>');
      expect(result).toBe('string[]');
    });

    it('should map List<int> to number[]', () => {
      const result = mapper.map('List<int>');
      expect(result).toBe('number[]');
    });

    it('should map List<bool> to boolean[]', () => {
      const result = mapper.map('List<bool>');
      expect(result).toBe('boolean[]');
    });

    it('should map List<DateTime> to string[]', () => {
      const result = mapper.map('List<DateTime>');
      expect(result).toBe('string[]');
    });

    it('should map IList<string> to string[]', () => {
      const result = mapper.map('IList<string>');
      expect(result).toBe('string[]');
    });

    it('should map IList<int> to number[]', () => {
      const result = mapper.map('IList<int>');
      expect(result).toBe('number[]');
    });

    it('should map string[] to string[]', () => {
      const result = mapper.map('string[]');
      expect(result).toBe('string[]');
    });

    it('should map int[] to number[]', () => {
      const result = mapper.map('int[]');
      expect(result).toBe('number[]');
    });

    it('should map bool[] to boolean[]', () => {
      const result = mapper.map('bool[]');
      expect(result).toBe('boolean[]');
    });
  });

  describe('Dictionaries', () => {
    it('should map Dictionary<string, int> to Record<string, number>', () => {
      const result = mapper.map('Dictionary<string, int>');
      expect(result).toBe('Record<string, number>');
    });

    it('should map Dictionary<int, string> to Record<number, string>', () => {
      const result = mapper.map('Dictionary<int, string>');
      expect(result).toBe('Record<number, string>');
    });

    it('should map Dictionary<string, bool> to Record<string, boolean>', () => {
      const result = mapper.map('Dictionary<string, bool>');
      expect(result).toBe('Record<string, boolean>');
    });

    it('should map Dictionary<string, DateTime> to Record<string, string>', () => {
      const result = mapper.map('Dictionary<string, DateTime>');
      expect(result).toBe('Record<string, string>');
    });

    it('should map IDictionary<string, int> to Record<string, number>', () => {
      const result = mapper.map('IDictionary<string, int>');
      expect(result).toBe('Record<string, number>');
    });
  });

  describe('Custom types', () => {
    it('should keep custom type EntityDto as-is', () => {
      const result = mapper.map('EntityDto');
      expect(result).toBe('EntityDto');
    });

    it('should keep custom type DepartmentDto as-is', () => {
      const result = mapper.map('DepartmentDto');
      expect(result).toBe('DepartmentDto');
    });

    it('should keep custom type UserViewModel as-is', () => {
      const result = mapper.map('UserViewModel');
      expect(result).toBe('UserViewModel');
    });

    it('should keep custom type FuncionarioViewModel as-is', () => {
      const result = mapper.map('FuncionarioViewModel');
      expect(result).toBe('FuncionarioViewModel');
    });

    it('should map List<EntityDto> to EntityDto[]', () => {
      const result = mapper.map('List<EntityDto>');
      expect(result).toBe('EntityDto[]');
    });

    it('should map List<DepartmentDto> to DepartmentDto[]', () => {
      const result = mapper.map('List<DepartmentDto>');
      expect(result).toBe('DepartmentDto[]');
    });

    it('should map Dictionary<string, EntityDto> to Record<string, EntityDto>', () => {
      const result = mapper.map('Dictionary<string, EntityDto>');
      expect(result).toBe('Record<string, EntityDto>');
    });
  });

  describe('Complex nested types', () => {
    it('should map List<string?> to (string | null)[]', () => {
      const result = mapper.map('List<string?>');
      expect(result).toBe('(string | null)[]');
    });

    it('should map List<int?> to (number | null)[]', () => {
      const result = mapper.map('List<int?>');
      expect(result).toBe('(number | null)[]');
    });

    it('should map List<DateTime?> to (string | null)[]', () => {
      const result = mapper.map('List<DateTime?>');
      expect(result).toBe('(string | null)[]');
    });

    it('should map Dictionary<string, int?> to Record<string, number | null>', () => {
      const result = mapper.map('Dictionary<string, int?>');
      expect(result).toBe('Record<string, number | null>');
    });

    it('should map Dictionary<string, List<int>> to Record<string, number[]>', () => {
      const result = mapper.map('Dictionary<string, List<int>>');
      expect(result).toBe('Record<string, number[]>');
    });
  });

  describe('Edge cases', () => {
    it('should handle unknown basic type gracefully', () => {
      const result = mapper.map('UnknownType');
      expect(result).toBe('UnknownType');
    });

    it('should handle empty string', () => {
      const result = mapper.map('');
      expect(result).toBe('');
    });
  });
});
