/**
 * FileSystem - Utilities for scanning, reading, and writing files
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

export interface ScanResult {
  /** full file path (r)*/
  path: string;
  /** file name (without path)*/
  name: string;
  /** file content */
  content: string;
}

export class FileSystem {
  async scan(
    patterns: string[],
    basePath: string = process.cwd(),
  ): Promise<string[]> {
    const allFiles: Set<string> = new Set();

    for (const p of patterns) {
      // Resolve pattern relative to base path
      const fullPattern = path.isAbsolute(p) ? p : path.join(basePath, p);

      // Normalize path separators for glob (always use forward slashes)
      const normalizedPattern = fullPattern.replace(/\\/g, '/');

      // Find matching files
      const files = await glob(normalizedPattern, {
        nodir: true, // Only files, not directories
        absolute: true, // Return absolute paths
        windowsPathsNoEscape: true, // Handle Windows paths correctly
      });
      // Add to set (automatically removes duplicates)
      files.forEach((file) => allFiles.add(file));
    }

    // Convert set to sorted array
    return Array.from(allFiles).sort();
  }

  /**
   * Reads a single file
   * @param filePath
   * @returns file content as string
   */
  read(filePath: string): string {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    return fs.readFileSync(filePath, 'utf-8');
  }

  /**
   * Reads multiple files
   * @param filePaths - Array of file paths
   * @returns Array of ScanResult objects
   */
  readMultiple(filePaths: string[]): ScanResult[] {
    return filePaths.map((filePath) => {
      const content = this.read(filePath);
      const name = path.basename(filePath);
      return { path: filePath, name, content };
    });
  }

  /**
   * Writes content to a file (creates directories if needed)
   * @param filePath - PAth to output file
   * @param content -  Content to write
   */
  write(filePath: string, content: string): void {
    // Create directory if it doesn't exist
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Write file
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  /**
   * Checks if a file exists
   * @param filePath - Path to check
   * @returns true if file exists
   */
  exists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * Ensures a directory exists (creates if needed)
   * @param dirPath - Directory path
   */
  ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}
