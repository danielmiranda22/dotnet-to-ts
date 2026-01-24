/**
 * ConfigLoader - Loads and validates dotnet-to-ts configuration
 */

import * as fs from 'fs';
import { DotnetToTsConfig, DEFAULT_CONFIG } from './Config.js';

export class ConfigLoader {
  /**
   * Loads config from a JSON file
   * @param configPath
   * @returns Parsed and validated config
   */
  load(configPath: string = 'dotnet-to-ts.config.json'): DotnetToTsConfig {
    if (!fs.existsSync(configPath)) {
      throw new Error(`Config file not found: ${configPath}`);
    }

    const fileContent = fs.readFileSync(configPath, 'utf-8');

    let parsed: any;
    try {
      parsed = JSON.parse(fileContent);
    } catch (error) {
      throw new Error(`Invalid JSON in config file: ${configPath}`);
    }

    // Validate and merge with defaults
    const config = this.validate(parsed);

    return config;
  }

  /**
   * Validates config and merges with defaults
   * @param parsed
   * @returns Valid config
   */
  private validate(parsed: any): DotnetToTsConfig {
    // Validate input
    if (!parsed.input) {
      throw new Error('Config must have "input" field');
    }

    if (!Array.isArray(parsed.input)) {
      throw new Error('"input" must be an array of glob patterns');
    }

    if (parsed.input.length === 0) {
      throw new Error('"input" array cannot be empty');
    }

    // Validate output
    if (!parsed.output) {
      throw new Error('Config must have "output" field');
    }

    if (typeof parsed.output !== 'string') {
      throw new Error('"output" must be a string');
    }

    // Merge with defaults
    const config: DotnetToTsConfig = {
      input: parsed.input,
      output: parsed.output,
      options: {
        indentation:
          parsed.options?.indentation ?? DEFAULT_CONFIG.options?.indentation,
        addTimestamp:
          parsed.options?.addTimestamp ?? DEFAULT_CONFIG.options?.addTimestamp,
        exportInterfaces:
          parsed.options?.exportInterfaces ??
          DEFAULT_CONFIG.options?.exportInterfaces,
      },
    };

    return config;
  }

  /**
   * Loads config or returns default if file doesn't exist
   * @param configPath
   * @returns Config (from file or default)
   */
  loadOrDefault(
    configPath: string = 'dotnet-to-ts.config.json',
  ): DotnetToTsConfig {
    try {
      return this.load(configPath);
    } catch (error) {
      // If file not found, return default
      if (error instanceof Error && error.message.includes('not found')) {
        return DEFAULT_CONFIG;
      }
      // Re-throw other errors (invalid JSON, validation, etc.)
      throw error;
    }
  }
}
