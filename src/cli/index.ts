#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { readSync } from 'node:fs';
import { run } from '../index.js';

function readLine(): string | undefined {
  const byte = Buffer.alloc(1);
  const bytes: number[] = [];
  while (true) {
    const count = readSync(0, byte, 0, 1, null);
    if (count === 0) return bytes.length ? Buffer.from(bytes).toString('utf8') : undefined;
    if (byte[0] === 10) return Buffer.from(bytes).toString('utf8').replace(/\r$/, '');
    bytes.push(byte[0]);
  }
}

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
    run(source, {
      readInput: readLine,
      random: upperBound => Math.min(upperBound - 1, Math.floor(Math.random() * upperBound)),
      writeOutput: text => { process.stdout.write(text); },
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
void main();
