import type { Program, RuntimeState } from './ast.js';
import { evaluate } from './evaluator.js';
import { UsagiError } from './errors.js';
import { parse } from './parser.js';

export interface RunOptions {
  maxSteps?: number;
  readInput?: () => string | number | undefined;
  /** Return an integer between 0 and upperBound - 1. */
  random?: (upperBound: number) => number;
  writeOutput?: (text: string) => void;
}
export function run(source: string | Program, options: RunOptions = {}): RuntimeState {
  const program = typeof source === 'string' ? parse(source) : source;
  const maxSteps = options.maxSteps ?? 100_000;
  if (!Number.isSafeInteger(maxSteps) || maxSteps < 1) throw new RangeError('maxSteps must be a positive safe integer');
  const state: RuntimeState = { pc: 0, variables: new Map(), output: '', stepCount: 0 };
  const write = (text: string) => { state.output += text; options.writeOutput?.(text); };
  while (state.pc < program.instructions.length) {
    const instruction = program.instructions[state.pc];
    if (state.stepCount >= maxSteps) throw new UsagiError('runtime', `최대 실행 횟수 ${maxSteps}회를 초과했습니다.`, instruction.location, state);
    state.stepCount++;
    const value = evaluate(instruction.operand, state);
    switch (instruction.opcode) {
      case 'END': return state;
      case 'ASSIGN': state.variables.set(instruction.variable!, value); state.pc++; break;
      case 'INPUT': {
        const input = options.readInput?.();
        if (input === undefined) throw new UsagiError('runtime', '입력값이 필요합니다.', instruction.location, state);
        const text = typeof input === 'string' ? input.trim() : undefined;
        const number = text === undefined ? input : Number(text);
        if ((text !== undefined && !/^[+-]?\d+$/.test(text)) || typeof number !== 'number' || !Number.isSafeInteger(number)) {
          throw new UsagiError('runtime', '안전한 범위의 정수를 입력해 주세요.', instruction.location, state);
        }
        state.variables.set(instruction.variable!, number); state.pc++; break;
      }
      case 'RANDOM': {
        if (value < 1) throw new UsagiError('runtime', '난수의 범위는 1 이상의 정수여야 합니다.', instruction.location, state);
        if (!options.random) throw new UsagiError('runtime', '난수를 제공하는 실행 환경이 필요합니다.', instruction.location, state);
        const randomValue = options.random(value);
        if (!Number.isSafeInteger(randomValue) || randomValue < 0 || randomValue >= value) {
          throw new UsagiError('runtime', '실행 환경이 유효하지 않은 난수를 제공했습니다.', instruction.location, state);
        }
        state.variables.set(instruction.variable!, randomValue); state.pc++; break;
      }
      case 'PRINT': case 'RAP_PRINT': write(`${value}\n`); state.pc++; break;
      case 'CHAR_PRINT':
        if (!instruction.operand.terms.length) write('\n');
        else {
          if (value < 0 || value > 0x10ffff || (value >= 0xd800 && value <= 0xdfff)) {
            throw new UsagiError('runtime', '유효한 유니코드 코드포인트가 아닙니다.', instruction.location, state);
          }
          write(String.fromCodePoint(value));
        }
        state.pc++;
        break;
      case 'IF_ZERO': state.pc += value === 0 ? 1 : 2; break;
      case 'GOTO':
        if (value < 1 || value > program.instructions.length) throw new UsagiError('runtime', `이동할 명령 번호 ${value}가 범위를 벗어났습니다.`, instruction.location, state);
        state.pc = value - 1;
        break;
    }
  }
  const last = program.instructions.at(-1);
  throw new UsagiError('runtime', '종료 명령을 실행하지 않고 프로그램을 벗어났습니다.', last?.location ?? { line: 1, column: 1 }, state);
}
