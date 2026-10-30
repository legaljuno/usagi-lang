import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { run } from '../src/index.js';

const source = readFileSync(new URL('../examples/rock-paper-scissors.usa', import.meta.url), 'utf8');

describe('우사기 가위바위보', () => {
  it.each([
    [0, 0, 0], [0, 1, -1], [0, 2, 1],
    [1, 0, 1], [1, 1, 0], [1, 2, -1],
    [2, 0, -1], [2, 1, 1], [2, 2, 0],
  ])('player %i against computer %i returns %i', (player, computer, result) => {
    const state = run(source, {readInput: () => player, random: bound => {
      expect(bound).toBe(3);
      return computer;
    }});
    expect(state.output).toBe(`${computer}\n${result}\n`);
  });
  it('rejects an invalid selection without drawing a random number', () => {
    expect(run(source, {readInput: () => 3, random: () => { throw new Error('should not draw'); }}).output).toBe('-2\n');
    expect(run(source, {readInput: () => -1, random: () => { throw new Error('should not draw'); }}).output).toBe('-2\n');
  });
});
