/**
 * Configuration for dotnet-to-ts
 */

export interface DotnetToTsConfig {
  /**
   * Input glob patterns for C# files
   */
  input: string[];

  /**
   * Output file path for generated TypeScript
   * Example: "types/generated.ts"
   */
  output: string;

  /**
   * Generator options
   */
  options?: GeneratorConfigOptions;
}

export interface GeneratorConfigOptions {
  /**
   * Indentation string (default: "  " - 2 spaces)
   */
  indentation?: string;

  /**
   * Add timestamp comment to generated files (default: true)
   */
  addTimestamp?: boolean;

  /**
   * Add export keyword to interfaces (default: true)
   */
  exportInterfaces?: boolean;

  /**
   * Property naming convention
   * (default: "preserve" - keep original C# naming)
   * camelCase - Js/TS standard
   * PascalCase - C# Force PascalCase (useful if source has inconsistent casing)
   */
  propertyNamingConvention?: 'camelCase' | 'PascalCase' | 'preserve';
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: DotnetToTsConfig = {
  input: ['**/*.cs'],
  output: 'generated.ts',
  options: {
    indentation: '  ',
    addTimestamp: true,
    exportInterfaces: true,
    propertyNamingConvention: 'preserve',
  },
};
