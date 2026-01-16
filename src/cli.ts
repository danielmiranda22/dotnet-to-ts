#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('dotnet-to-ts')
  .description('Generate TypeScript interfaces from . NET Models')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate TypeScript types from C# files')
  .action(() => {
    console.log('🚀 Generating TypeScript types...');
    console.log('✅ Done!  (placeholder for now)');
  });

program.parse();
