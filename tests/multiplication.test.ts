import { describe, expect, it } from 'vitest';
import { lex, parse, run, UsagiError } from '../src/index.js';

const program = (body: string) => `야하!\n${body}\n우라라!`;

describe('뿌릿 multiplication', () => {
  it('multiplies the sums on both sides, with and without whitespace', () => {
    expect(run(program('우라! 야야야 뿌릿 이이히\n우라! 이이히 뿌릿 이이이히 하\n우라! 야야야뿌릿이이히')).output)
      .toBe('6\n4\n6\n');
  });
  it('multiplies several groups, including variables, negative values and zero', () => {
    const source = '우 이이히\n우우 이이이히\n우라! 라 뿌릿 라라 뿌릿 이이이이히\n우라! 하하 뿌릿 이이이히\n우라! 야 하 뿌릿 이이이히';
    expect(run(program(source)).output).toBe('24\n-6\n0\n');
  });
  it('works in assignment, condition, character output, and jump expressions', () => {
    expect(run(program('우 야야 뿌릿 이이이히\n하아? 라 하하하하하하\n우라! 라')).output).toBe('6\n');
    expect(run(program('푸루루! 이이이이이이이이히 뿌릿 이이이이이이이이이히')).output).toBe('H');
    expect(run(program('야하? 야야 뿌릿 이이히\n우라! 야\n우라! 야')).output).toBe('');
  });
  it('preserves existing empty operands and longest matching', () => {
    expect(run(program('우 야야\n우\n푸루루!\n우라! 라\n우라! 야하 뿌릿 야 하')).output).toBe('\n0\n0\n');
    expect(lex('야하!\n우라! 야뿌릿이이히\n우라라!').find(t => t.type === 'MULTIPLY')?.location).toEqual({line: 2, column: 6});
  });
  it('rejects missing operands, including comments and empty assignment/character arguments', () => {
    for (const command of ['우라! 뿌릿 야', '우라! 야 뿌릿', '우라! 야 뿌릿 뿌릿 야', '우 뿌릿', '푸루루! 뿌릿', '우라! 야 뿌릿 # 주석']) {
      expect(() => parse(program(command)), command).toThrow(/뿌릿/);
    }
    try { parse(program('우라! 야 뿌릿')); throw new Error('expected error'); }
    catch (error) { expect(error).toBeInstanceOf(UsagiError); expect((error as UsagiError).location).toEqual({line: 2, column: 7}); }
  });
  it('rejects unsafe products and unsafe group sums even if a later factor is zero', () => {
    const prefix = '우 야\n' + '우 라 라\n'.repeat(52);
    expect(() => run(program(prefix + '우라! 라 뿌릿 이이히'))).toThrow(/안전한 정수/);
    expect(() => run(program(prefix + '우라! 라 라 뿌릿 야 하'))).toThrow(/안전한 정수/);
  });
});
