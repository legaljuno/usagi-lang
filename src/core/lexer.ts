import type { Token, TokenType } from './ast.js';
import { UsagiError } from './errors.js';

const commands: [RegExp, TokenType][] = [
  [/^야하!/, 'START'], [/^우라라!/, 'END'], [/^이?야아+하아+!/, 'RAP_PRINT'],
  [/^우라!/, 'PRINT'], [/^푸루루!/, 'CHAR_PRINT'], [/^하아\?/, 'IF_ZERO'],
  [/^야하\?/, 'GOTO'], [/^우+/, 'ASSIGN'],
];

/** Tokenize normalized source. Locations are 1-based positions in NFC-normalized text. */
export function lex(source: string): Token[] {
  const tokens: Token[] = [];
  const lines = source.normalize('NFC').split(/\r\n|\n|\r/);
  lines.forEach((original, index) => {
    const line = original.split('#', 1)[0];
    let offset = 0;
    const skipSpace = () => { while (offset < line.length && /\s/u.test(line[offset])) offset++; };
    skipSpace();
    if (offset === line.length) return;
    const location = () => ({ line: index + 1, column: offset + 1 });
    const match = commands.map(([pattern, type]) => ({ match: line.slice(offset).match(pattern), type }))
      .find(item => item.match);
    if (!match?.match) throw new UsagiError('syntax', '알 수 없는 명령입니다.', location());
    const command = match.match[0];
    tokens.push({ type: match.type, value: command, location: location() });
    offset += command.length;
    while (offset < line.length) {
      skipSpace();
      if (offset >= line.length) break;
      const term = line.slice(offset).match(/^(뿌릿|야하|이+히+|라+|야|하)/u)?.[0];
      if (!term) throw new UsagiError('syntax', `알 수 없는 토큰 '${line[offset]}'입니다.`, location());
      tokens.push({ type: term === '뿌릿' ? 'MULTIPLY' : term.startsWith('라') ? 'VARIABLE' : 'NUMBER', value: term, location: location() });
      offset += term.length;
    }
    tokens.push({ type: 'EOL', value: '', location: { line: index + 1, column: line.length + 1 } });
  });
  return tokens;
}
