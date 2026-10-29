import { describe, expect, it } from 'vitest';
import { lex, parse, run, UsagiError } from '../src/index.js';

const program = (body: string) => `야하!\n${body}\n우라라!`;

describe('Usagi Lang v0.2', () => {
  it('distinguishes the longest token from whitespace-separated terms', () => {
    expect(run(program('우라! 야하\n우라! 야 하\n우라! 이히히 야하 이이히\n우라! 이히히히')).output)
      .toBe('1\n0\n4\n1\n');
  });
  it('supports adjacent assignments, reassignment, and initially zero variables', () => {
    expect(run(program('우야야야\n우우 라 야하\n우 라 하\n우라!라라\n우라! 라\n우라! 라라라')).output)
      .toBe('4\n2\n0\n');
    expect(run(program('우 야야\n우\n우라! 라')).output).toBe('0\n');
  });
  it('counts executable instructions, not start, blank lines, or comments', () => {
    const source = `야하! # start\n우 이이이히\n\n# loop\n우라! 라\n우 라 하\n하아? 라\n야하? 야야야야야야야\n야하? 이이히\n우라라!`;
    expect(run(source).output).toBe('3\n2\n1\n');
  });
  it('runs the next instruction on zero and skips exactly one otherwise', () => {
    expect(run(program('하아? 야 하\n우라! 야\n하아? 야\n우라! 야야\n우라! 이이이히')).output)
      .toBe('1\n3\n');
  });
  it('accepts rap aliases and emits Unicode characters and a newline', () => {
    expect(run(program('이야아하아! 이히히 야하 이이히\n야아아하아아! 야\n푸루루! 이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이이히\n푸루루!')).output)
      .toBe('4\n1\nA\n');
  });
  it('reports missing delimiters, invalid tokens, and missing operands with positions', () => {
    expect(() => parse('야하!\n우라! 야')).toThrow(/우라라!/);
    expect(() => parse('우라라!')).toThrow(/야하!/);
    expect(() => parse(program('우라! 뿅'))).toThrow(/2행 5열/);
    expect(() => parse(program('우라!'))).toThrow(/수식/);
    expect(() => parse(program('우라라!\n우라! 야'))).toThrow();
  });
  it('exposes token locations, and NFC normalizes source', () => {
    const tokens = lex('야하!\n  우라! 야하 # comment\n우라라!');
    expect(tokens.find(t => t.type === 'PRINT')?.location).toEqual({ line: 2, column: 3 });
    expect(run('야하!\n우라! 야\n우라라!').output).toBe('1\n');
  });
  it('rejects invalid jumps, invalid code points and infinite loops', () => {
    expect(() => run(program('야하? 하'))).toThrow(/범위/);
    expect(() => run(program('푸루루! 하'))).toThrow(/코드포인트/);
    expect(() => run(program('야하? 야'), { maxSteps: 10 })).toThrow(/실행 횟수/);
  });
  it('throws a typed runtime error with the responsible location', () => {
    try { run(program('야하? 하')); throw new Error('expected error'); }
    catch (error) {
      expect(error).toBeInstanceOf(UsagiError);
      expect((error as UsagiError).location).toEqual({ line: 2, column: 1 });
    }
  });
  it('rejects unsafe intermediate integer sums', () => {
    const source = program('우 야\n' + '우 라 라\n'.repeat(54) + '우라! 라');
    expect(() => run(source)).toThrow(/안전한 정수/);
  });
});
