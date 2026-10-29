import type { Expression, Instruction, Program, Token } from './ast.js';
import { UsagiError } from './errors.js';
import { lex } from './lexer.js';

/** Parse a complete program; START is excluded from instruction numbering. */
export function parse(source: string): Program {
  const tokens = lex(source);
  const lines: Token[][] = [];
  let current: Token[] = [];
  for (const token of tokens) {
    if (token.type === 'EOL') { lines.push(current); current = []; }
    else current.push(token);
  }
  const first = lines[0];
  if (!first || first[0].type !== 'START') {
    throw new UsagiError('syntax', '프로그램은 야하!로 시작해야 합니다.', first?.[0].location ?? { line: 1, column: 1 });
  }
  if (first.length !== 1) throw new UsagiError('syntax', '야하! 뒤에는 수식을 쓸 수 없습니다.', first[1].location);
  const instructions: Instruction[] = [];
  let ended = false;
  for (const line of lines.slice(1)) {
    const [command, ...terms] = line;
    if (ended) throw new UsagiError('syntax', '우라라! 뒤에는 명령을 쓸 수 없습니다.', command.location);
    if (command.type === 'START') throw new UsagiError('syntax', '야하!는 프로그램 맨 앞에 한 번만 쓸 수 있습니다.', command.location);
    if (command.type === 'END') {
      if (terms.length) throw new UsagiError('syntax', '우라라! 뒤에는 수식을 쓸 수 없습니다.', terms[0].location);
      ended = true;
      instructions.push({ opcode: 'END', operand: { terms: [] }, location: command.location });
      continue;
    }
    if (!['ASSIGN', 'PRINT', 'RAP_PRINT', 'CHAR_PRINT', 'IF_ZERO', 'GOTO'].includes(command.type)) {
      throw new UsagiError('syntax', '명령이 필요합니다.', command.location);
    }
    if (!terms.length && !['ASSIGN', 'CHAR_PRINT'].includes(command.type)) {
      throw new UsagiError('syntax', '이 명령에는 수식이 필요합니다.', command.location);
    }
    const operand: Expression = { terms: terms.map(token => ({
      kind: token.type === 'VARIABLE' ? 'variable' : 'number',
      value: token.type === 'VARIABLE' ? token.value.length : token.value === '야하' || token.value === '야' ? 1 : token.value === '하' ? -1 : token.value.match(/^이+/)![0].length,
      location: token.location,
    })) };
    instructions.push({ opcode: command.type as Instruction['opcode'], operand, location: command.location,
      ...(command.type === 'ASSIGN' ? { variable: command.value.length } : {}) });
  }
  if (!ended) {
    const last = lines.at(-1)?.[0].location ?? first[0].location;
    throw new UsagiError('syntax', '프로그램은 우라라!로 끝나야 합니다.', last);
  }
  return { instructions };
}
