#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { run, UsagiError } from '../index.js';

async function main(): Promise<void> {
  const [command, file, ...extra] = process.argv.slice(2);
  if (command === '--help' || command === '-h') {
    console.log('사용법: usa run <파일.usa>');
    return;
  }
  if (command !== 'run' || !file || extra.length) {
    console.error('사용법: usa run <파일.usa>');
    process.exitCode = 2;
    return;
  }
  try {
    const source = await readFile(file, 'utf8');
    const result = run(source);
    process.stdout.write(result.output);
  } catch (error) {
    if (error instanceof UsagiError && error.state?.output) process.stdout.write(error.state.output);
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
void main();
