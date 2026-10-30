import { describe, expect, it } from 'vitest';
import { parse, run } from '../src/index.js';

const program = (body: string) => `야하!\n${body}\n우라라!`;

describe('input and random host integration', () => {
  it('reads integer values into numbered variables and streams output', () => {
    const input = [' -2 ', '3'];
    const chunks: string[] = [];
    const state = run(program('우?\n우우?\n우라! 라\n우라! 라라'), { readInput: () => input.shift(), writeOutput: text => chunks.push(text) });
    expect(state.output).toBe('-2\n3\n');
    expect(chunks.join('')).toBe(state.output);
  });
  it('reports missing or invalid input at the input command', () => {
    expect(() => run(program('우?'))).toThrow(/입력/);
    for (const value of ['', '1.2', '1x', '9007199254740992']) {
      expect(() => run(program('우?'), {readInput: () => value}), value).toThrow(/정수/);
    }
  });
  it('uses a supplied random integer within the requested exclusive bound', () => {
    const bounds: number[] = [];
    const state = run(program('우우야하? 이이이히\n우라! 라라'), {random: bound => { bounds.push(bound); return 2; }});
    expect(bounds).toEqual([3]);
    expect(state.output).toBe('2\n');
  });
  it('rejects missing random providers, invalid bounds and out-of-range random results', () => {
    expect(() => run(program('우우야하? 이이이히'))).toThrow(/난수/);
    expect(() => run(program('우우야하? 야 하'), {random: () => 0})).toThrow(/범위/);
    expect(() => run(program('우우야하? 이이이히'), {random: () => 3})).toThrow(/난수/);
    expect(() => run(program('우우야하? 이이이히'), {random: () => 0.5})).toThrow(/난수/);
  });
  it('requires an operand only for random generation', () => {
    expect(() => parse(program('우? 야'))).toThrow(/수식/);
    expect(() => parse(program('우우야하?'))).toThrow(/수식/);
  });
});
