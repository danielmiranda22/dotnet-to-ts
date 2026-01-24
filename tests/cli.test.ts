import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';

const cliBin = path.join(__dirname, '..', 'dist', 'cli.js');
const configPath = path.join(__dirname, '..', 'dotnet-to-ts.config.json');
const outputPath = path.join(__dirname, '..', 'output', 'generated.ts');

function cleanup() {
  if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
  if (fs.existsSync(configPath)) fs.unlinkSync(configPath);
}

// Clean up before/after all tests
beforeEach(cleanup);
afterEach(cleanup);

describe('dotnet-to-ts CLI', () => {
  it('should create a config file with init', () => {
    const result = spawnSync('node', [cliBin, 'init'], { encoding: 'utf-8' });
    expect(result.status).toBe(0);
    expect(fs.existsSync(configPath)).toBe(true);
    const content = fs.readFileSync(configPath, 'utf-8');
    expect(content).toMatch('"input"');
  });

  it('should generate TypeScript interfaces from C#', () => {
    // arrange valid config with real .cs fixtures
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        input: ['tests/fixtures/**/*.cs'],
        output: 'output/generated.ts',
      }),
    );
    const result = spawnSync('node', [cliBin, configPath], {
      encoding: 'utf-8',
    });
    expect(result.status).toBe(0);
    expect(fs.existsSync(outputPath)).toBe(true);
    const ts = fs.readFileSync(outputPath, 'utf-8');
    expect(ts).toMatch(/export interface/);
    expect(result.stdout).toMatch(/Found \d+ C# files/);
  });

  it('should error on missing config', () => {
    const missingConfig = path.join(__dirname, 'not-a-config.json');
    const result = spawnSync('node', [cliBin, missingConfig], {
      encoding: 'utf-8',
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/Failed to load config/);
  });

  it('should error on malformed config', () => {
    const badConfig = path.join(__dirname, 'bad-config.json');
    fs.writeFileSync(badConfig, "{ not: 'json',");
    const result = spawnSync('node', [cliBin, badConfig], {
      encoding: 'utf-8',
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/Failed to load config/);
    fs.unlinkSync(badConfig);
  });

  it('should error if no matching files in input', () => {
    const emptyConfig = path.join(__dirname, 'no-match-config.json');
    fs.writeFileSync(
      emptyConfig,
      JSON.stringify({
        input: ['tests/fixtures/NOPE/**/*.cs'],
        output: 'output/none.ts',
      }),
    );
    const result = spawnSync('node', [cliBin, emptyConfig], {
      encoding: 'utf-8',
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/Failed to load config/);
    fs.unlinkSync(emptyConfig);
  });

  it('should log debug lines with --verbose', () => {
    // ...write config, then spawn with --verbose...
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        input: ['tests/fixtures/**/*.cs'],
        output: 'output/generated.ts',
      }),
    );
    const result = spawnSync('node', [cliBin, '--verbose', configPath], {
      encoding: 'utf-8',
    });
    expect(result.stdout).toMatch(/Parsed class structure/);
  });
});
