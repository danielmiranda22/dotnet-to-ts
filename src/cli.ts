#!/usr/bin/env node

import { ConfigLoader } from './config/ConfigLoader';
import { FileSystem } from './utils/FileSystem';
import { CSharpParser } from './parser/CSharpParser';
import { TypeScriptGenerator } from './generator/TypeScriptGenerator';
import * as path from 'path';
import * as fs from 'fs';

async function main() {
  console.log('🔷 dotnet-to-ts - TypeScript generator for C# DTOs 🔷');

  // 1. Load config
  const configPath = process.argv[2] || 'dotnet-to-ts.config.json';
  const configLoader = new ConfigLoader();
  let config;

  try {
    config = configLoader.load(configPath);
    console.log(`📄 Loaded config: ${configPath}`);
  } catch (err) {
    console.error(`❌ Failed to load config: ${(err as Error).message}`);
    process.exit(1);
  }

  // 2. Scan for C# files
  const fileSystem = new FileSystem();
  console.log('🔎 Scanning for C# files...');
  const files = await fileSystem.scan(config.input);
  if (files.length === 0) {
    console.error('❌ No C# files found with specified input patterns.');
    process.exit(1);
  }
  console.log(`✅ Found ${files.length} C# files.`);

  // 3. Read all files
  const results = fileSystem.readMultiple(files);

  // 4. Parse classes
  const parser = new CSharpParser();
  const parsed = results
    .map((res) => parser.parse(res.content))
    .filter((cls) => cls !== null);

  if (parsed.length === 0) {
    console.error('❌ No parsable classes found in C# files.');
    process.exit(1);
  }
  console.log(`��� Parsed ${parsed.length} classes.`);

  // 5. Generate TypeScript
  const generator = new TypeScriptGenerator(config.options as any);
  const tsCode = generator.generateMultiple(parsed as any[]);

  // 6. Write to output file
  fileSystem.write(config.output, tsCode);
  console.log(`✅ Written TypeScript interfaces to: ${config.output}`);

  // 7. Done
  console.log('🎉 Done!');
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
