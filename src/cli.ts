#!/usr/bin/env node

import { DEFAULT_CONFIG } from './config/Config.js';
import { ConfigLoader } from './config/ConfigLoader.js';
import { FileSystem } from './utils/FileSystem.js';
import { CSharpParser } from './parser/CSharpParser.js';
import { TSGenerator } from './generator/TSGenerator.js';
import { Logger } from './utils/Logger.js';
import * as fs from 'fs';

async function main() {
  const args = process.argv.slice(2);
  const isVerbose = args.includes('--verbose');
  const commandArgs = args.filter((arg) => !arg.startsWith('--'));
  const [arg1, arg2] = commandArgs;

  Logger.info('dotnet-to-ts - TypeScript generator for C# DTOs');

  // -- Step 1: INIT
  if (arg1 === 'init') {
    const configPath = 'dotnet-to-ts.config.json';
    if (fs.existsSync(configPath)) {
      Logger.warn(`Config file already exists at: ${configPath}`);
      process.exit(1);
    }
    fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
    Logger.success('Created dotnet-to-ts.config.json with default settings.');
    process.exit(0);
  }

  // -- Step 2: Config discovery
  let configPath: string;
  if (
    arg1 === 'generate' ||
    arg1 === 'generate:ts' ||
    !arg1 ||
    (arg1 && arg1.endsWith('.json'))
  ) {
    configPath = arg2 || 'dotnet-to-ts.config.json';
  } else {
    configPath = arg1;
  }

  // -- Step 3: Load config
  const configLoader = new ConfigLoader();
  let config;
  try {
    config = configLoader.load(configPath);
    Logger.step(`Loaded config: ${configPath}`);
    Logger.debug(JSON.stringify(config, null, 2), isVerbose);
  } catch (err) {
    Logger.error(`Failed to load config: ${(err as Error).message}`);
    Logger.info('Hint: Did you forget a comma or quote in your config file?');
    process.exit(1);
  }

  // -- Step 4: Scan for C# files
  Logger.step('Scanning for C# files...');
  console.time('Scan');
  const fileSystem = new FileSystem();
  let files: string[] = [];
  try {
    files = await fileSystem.scan(config.input);
  } catch (scanErr) {
    Logger.error('Error scanning files: ' + (scanErr as Error).message);
    process.exit(1);
  }
  console.timeEnd('Scan');
  Logger.debug('C# files:\n' + files.join('\n'), isVerbose);

  if (files.length === 0) {
    Logger.error('No C# files found with specified input patterns.');
    Logger.info(
      'Hint: Check your `input` globs and run from your solution root, e.g. "Models/**/*.cs"',
    );
    process.exit(1);
  }
  Logger.success(`Found ${files.length} C# files.`);

  // -- Step 5: Read and parse files
  Logger.step('Parsing files...');
  console.time('Parse');
  const results = fileSystem.readMultiple(files);
  const parser = new CSharpParser();
  const parsed = results
    .map((res) => parser.parse(res.content))
    .filter((cls) => cls !== null);
  console.timeEnd('Parse');

  Logger.debug(
    'Parsed class structures:\n' + JSON.stringify(parsed, null, 2),
    isVerbose,
  );

  if (parsed.length === 0) {
    Logger.error('No parsable classes found in C# files.');
    Logger.info(
      'Hint: Only public classes with standard properties are supported.',
    );
    process.exit(1);
  }
  Logger.success(`Parsed ${parsed.length} classes.`);

  // -- Step 6: Generate TypeScript
  Logger.step('Generating TypeScript...');
  console.time('Generate');
  const generator = new TSGenerator(config.options as any);
  const tsCode = generator.generateMultiple(parsed as any[]);
  console.timeEnd('Generate');

  // -- Step 7: Write output
  Logger.step(`Writing TypeScript interfaces to: ${config.output}`);
  try {
    fileSystem.write(config.output, tsCode);
  } catch (writeErr) {
    Logger.error('Failed to write output: ' + (writeErr as Error).message);
    process.exit(1);
  }
  Logger.success(`Written TypeScript interfaces to: ${config.output}`);

  // -- Step 8: Done
  Logger.success('Done!');
}

main().catch((err) => {
  Logger.error('Unexpected error: ' + (err as Error).message);
  process.exit(1);
});
