#!/usr/bin/env node

import { DEFAULT_CONFIG } from './config/Config';
import { ConfigLoader } from './config/ConfigLoader';
import { FileSystem } from './utils/FileSystem';
import { CSharpParser } from './parser/CSharpParser';
import { TypeScriptGenerator } from './generator/TypeScriptGenerator';
import * as path from 'path';
import * as fs from 'fs';

async function main() {
  console.log('🔷 dotnet-to-ts - TypeScript generator for C# DTOs 🔷');

  const [, , arg1] = process.argv;

  // -- Step 1: INIT Command
  if (arg1 === 'init') {
    const configPath = 'dotnet-to-ts.config.json';
    if (fs.existsSync(configPath)) {
      console.error(`⚠️  Config file already exists at: ${configPath}`);
      process.exit(1);
    }
    fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
    console.log('✅ Created dotnet-to-ts.config.json with default settings.');
    process.exit(0);
  }

  // -- Step 2: Config discovery
  // Accepts: dotnet-to-ts [configPath] or dotnet-to-ts generate:ts [configPath]
  let configPath: string | undefined;
  if (arg1 === 'generate' || arg1 === 'generate:ts' || !arg1) {
    // "dotnet-to-ts", "dotnet-to-ts generate", or "dotnet-to-ts generate:ts"
    configPath = process.argv[3] || 'dotnet-to-ts.config.json';
  } else {
    // Allow direct path as first argument
    configPath = arg1;
  }

  // -- Step 3: Load config
  const configLoader = new ConfigLoader();
  let config;
  try {
    config = configLoader.load(configPath);
    console.log(`📄 Loaded config: ${configPath}`);
  } catch (err) {
    console.error(`❌ Failed to load config: ${(err as Error).message}`);
    process.exit(1);
  }

  // -- Step 4: Scan for C# files
  const fileSystem = new FileSystem();
  console.log('🔎 Scanning for C# files...');
  const files = await fileSystem.scan(config.input);
  if (files.length === 0) {
    console.error('❌ No C# files found with specified input patterns.');
    process.exit(1);
  }
  console.log(`✅ Found ${files.length} C# files.`);

  // -- Step 5: Read and parse files
  const results = fileSystem.readMultiple(files);
  const parser = new CSharpParser();
  const parsed = results
    .map((res) => parser.parse(res.content))
    .filter((cls) => cls !== null);

  if (parsed.length === 0) {
    console.error('❌ No parsable classes found in C# files.');
    process.exit(1);
  }
  console.log(`✅ Parsed ${parsed.length} classes.`);

  // -- Step 6: Generate TypeScript
  const generator = new TypeScriptGenerator(config.options as any);
  const tsCode = generator.generateMultiple(parsed as any[]);

  // -- Step 7: Write output
  fileSystem.write(config.output, tsCode);
  console.log(`✅ Written TypeScript interfaces to: ${config.output}`);

  // -- Step 8: Done
  console.log('🎉 Done!');
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
