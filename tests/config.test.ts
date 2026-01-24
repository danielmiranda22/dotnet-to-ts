import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConfigLoader } from '../src/config/ConfigLoader.js';
import path from 'path';
import fs from 'fs';
import { DEFAULT_CONFIG } from '../src/config/Config.js';

describe('ConfigLoader', () => {
  let loader: ConfigLoader;
  const testConfigDir = path.join(__dirname, 'test-configs');

  beforeEach(() => {
    loader = new ConfigLoader();

    if (!fs.existsSync(testConfigDir)) {
      fs.mkdirSync(testConfigDir);
    }
  });

  afterEach(() => {
    if (fs.existsSync(testConfigDir)) {
      fs.rmSync(testConfigDir, { recursive: true, force: true });
    }
  });

  describe('Valid Configuration Loading', () => {
    it('should load a valid configuration file', () => {
      // Arrange
      const configPath = path.join(testConfigDir, 'valid.json');
      const config = {
        input: ['Models/**/*.cs'],
        output: 'types/generated.ts',
      };
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      // Act
      const result = loader.load(configPath);

      // Assert
      expect(result.input).toEqual(['Models/**/*.cs']);
      expect(result.output).toBe('types/generated.ts');
      expect(result.options).toBeDefined();
    });

    it('should load config with multiple input patterns', () => {
      // Arrange
      const configPath = path.join(testConfigDir, 'multiple-inputs.json');
      const config = {
        input: ['Models/**/*.cs', 'ViewModels/**/*. cs', 'DTOs/**/*.cs'],
        output: 'types/all. ts',
      };
      fs.writeFileSync(configPath, JSON.stringify(config));

      // Act
      const result = loader.load(configPath);

      // Assert
      expect(result.input).toHaveLength(3);
      expect(result.input).toContain('Models/**/*.cs');
      expect(result.input).toContain('ViewModels/**/*. cs');
      expect(result.input).toContain('DTOs/**/*.cs');
      expect(result.options).toBeDefined();
    });

    it('should load config with custom options', () => {
      // Arrange
      const configPath = path.join(testConfigDir, 'custom-options.json');
      const config = {
        input: ['**/*.cs'],
        output: 'output.ts',
        options: {
          indentation: '    ',
          addTimestamp: false,
          exportInterfaces: false,
        },
      };
      fs.writeFileSync(configPath, JSON.stringify(config));

      // Act
      const result = loader.load(configPath);

      // Assert
      expect(result.options?.indentation).toBe('    ');
      expect(result.options?.addTimestamp).toBe(false);
      expect(result.options?.exportInterfaces).toBe(false);
    });

    it('should merge partial options with defaults', () => {
      // Arrange
      const configPath = path.join(testConfigDir, 'partial-options.json');
      const config = {
        input: ['**/*.cs'],
        output: 'output.ts',
        options: {
          indentation: '\t', // Only override indentation
        },
      };
      fs.writeFileSync(configPath, JSON.stringify(config));

      // Act
      const result = loader.load(configPath);

      // Assert
      expect(result.options?.indentation).toBe('\t'); // Custom
      expect(result.options?.addTimestamp).toBe(true); // Default
      expect(result.options?.exportInterfaces).toBe(true); // Default
    });

    it('should use defaults when options are not provided', () => {
      // Arrange
      const configPath = path.join(testConfigDir, 'no-options.json');
      const config = {
        input: ['**/*.cs'],
        output: 'output.ts',
      };
      fs.writeFileSync(configPath, JSON.stringify(config));

      // Act
      const result = loader.load(configPath);

      // Assert
      expect(result.options?.indentation).toBe('  ');
      expect(result.options?.addTimestamp).toBe(true);
      expect(result.options?.exportInterfaces).toBe(true);
    });
  });

  describe('Validation errors', () => {
    it('should throw error when config file does not exist', () => {
      // Arrange
      const nonExistentPath = path.join(testConfigDir, 'missing.json');

      // Act & Assert
      expect(() => loader.load(nonExistentPath)).toThrow(
        'Config file not found',
      );
    });

    it('should throw error when JSON is invalid', () => {
      // Arrange
      const configPath = path.join(testConfigDir, 'invalid-json.json');
      fs.writeFileSync(configPath, '{ "input": [invalid json}');

      // Act & Assert
      expect(() => loader.load(configPath)).toThrow(
        'Invalid JSON in config file',
      );
    });

    it('should throw error when input field is missing', () => {
      // Arrange
      const configPath = path.join(testConfigDir, 'no-input.json');
      const config = {
        output: 'output.ts',
      };
      fs.writeFileSync(configPath, JSON.stringify(config));

      // Act & Assert
      expect(() => loader.load(configPath)).toThrow(
        'Config must have "input" field',
      );
    });

    it('should throw error when input is not an array', () => {
      // Arrange
      const configPath = path.join(testConfigDir, 'input-not-array.json');
      const config = {
        input: 'Models/**/*.cs', // Should be array
        output: 'output.ts',
      };
      fs.writeFileSync(configPath, JSON.stringify(config));

      // Act & Assert
      expect(() => loader.load(configPath)).toThrow(
        '"input" must be an array of glob patterns',
      );
    });

    it('should throw error when input array is empty', () => {
      // Arrange
      const configPath = path.join(testConfigDir, 'empty-input.json');
      const config = {
        input: [],
        output: 'output.ts',
      };
      fs.writeFileSync(configPath, JSON.stringify(config));

      // Act & Assert
      expect(() => loader.load(configPath)).toThrow(
        '"input" array cannot be empty',
      );
    });

    it('should throw error when output field is missing', () => {
      // Arrange
      const configPath = path.join(testConfigDir, 'no-output.json');
      const config = {
        input: ['**/*.cs'],
      };
      fs.writeFileSync(configPath, JSON.stringify(config));

      // Act & Assert
      expect(() => loader.load(configPath)).toThrow(
        'Config must have "output" field',
      );
    });

    it('should throw error when output is not a string', () => {
      // Arrange
      const configPath = path.join(testConfigDir, 'output-not-string.json');
      const config = {
        input: ['**/*.cs'],
        output: ['output.ts'], // Should be string
      };
      fs.writeFileSync(configPath, JSON.stringify(config));

      // Act & Assert
      expect(() => loader.load(configPath)).toThrow(
        '"output" must be a string',
      );
    });
  });
  describe('loadOrDefault()', () => {
    it('should load config if file exists', () => {
      // Arrange
      const configPath = path.join(testConfigDir, 'exists.json');
      const config = {
        input: ['Custom/**/*.cs'],
        output: 'custom.ts',
      };
      fs.writeFileSync(configPath, JSON.stringify(config));

      // Act
      const result = loader.loadOrDefault(configPath);

      // Assert
      expect(result.input).toEqual(['Custom/**/*.cs']);
      expect(result.output).toBe('custom.ts');
    });

    it('should return default config if file does not exist', () => {
      // Arrange
      const nonExistentPath = path.join(testConfigDir, 'missing.json');

      // Act
      const result = loader.loadOrDefault(nonExistentPath);

      // Assert
      expect(result).toEqual(DEFAULT_CONFIG);
    });

    it('should throw error for invalid JSON even with loadOrDefault', () => {
      // Arrange
      const configPath = path.join(testConfigDir, 'invalid.json');
      fs.writeFileSync(configPath, 'not json');

      // Act & Assert
      expect(() => loader.loadOrDefault(configPath)).toThrow('Invalid JSON');
    });

    it('should throw error for validation errors even with loadOrDefault', () => {
      // Arrange
      const configPath = path.join(testConfigDir, 'invalid-config.json');
      const config = {
        input: 'not-an-array',
        output: 'output.ts',
      };
      fs.writeFileSync(configPath, JSON.stringify(config));

      // Act & Assert
      expect(() => loader.loadOrDefault(configPath)).toThrow(
        '"input" must be an array',
      );
    });

    describe('Edge cases', () => {
      it('should handle config with extra unknown fields', () => {
        // Arrange
        const configPath = path.join(testConfigDir, 'extra-fields.json');
        const config = {
          input: ['**/*.cs'],
          output: 'output.ts',
          unknownField: 'should be ignored',
          anotherField: 123,
        };
        fs.writeFileSync(configPath, JSON.stringify(config));

        // Act
        const result = loader.load(configPath);

        // Assert - Should not throw, extra fields ignored
        expect(result.input).toEqual(['**/*.cs']);
        expect(result.output).toBe('output.ts');
      });

      it('should handle single input pattern', () => {
        // Arrange
        const configPath = path.join(testConfigDir, 'single-input.json');
        const config = {
          input: ['Models/UserDto.cs'],
          output: 'output.ts',
        };
        fs.writeFileSync(configPath, JSON.stringify(config));

        // Act
        const result = loader.load(configPath);

        // Assert
        expect(result.input).toHaveLength(1);
        expect(result.input[0]).toBe('Models/UserDto.cs');
      });

      it('should handle absolute paths', () => {
        // Arrange
        const configPath = path.join(testConfigDir, 'absolute-paths.json');
        const config = {
          input: ['C:/Projects/MyApp/Models/**/*.cs'],
          output: 'C:/Projects/MyApp/types/generated.ts',
        };
        fs.writeFileSync(configPath, JSON.stringify(config));

        // Act
        const result = loader.load(configPath);

        // Assert
        expect(result.input[0]).toBe('C:/Projects/MyApp/Models/**/*.cs');
        expect(result.output).toBe('C:/Projects/MyApp/types/generated.ts');
      });
    });
  });
});
