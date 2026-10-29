import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { run } from '../src/index.js';

const example = (name: string) => readFileSync(new URL(`../examples/${name}.usa`, import.meta.url), 'utf8');

describe('shipped programs', () => {
  it('prints 4 from the rap example', () => expect(run(example('rap')).output).toBe('4\n'));
  it('counts down and leaves the variable at zero', () => {
    const result = run(example('countdown'));
    expect(result.output).toBe('3\n2\n1\n');
    expect(result.variables.get(1)).toBe(0);
  });
  it('prints Unicode characters and a newline', () => expect(run(example('hello')).output).toBe('Hi!\n'));
});
