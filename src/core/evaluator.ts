import type { Expression, RuntimeState } from './ast.js';
import { UsagiError } from './errors.js';

export function evaluate(expression: Expression, state: RuntimeState): number {
  let value = 0;
  for (const term of expression.terms) {
    value += term.kind === 'variable' ? (state.variables.get(term.value) ?? 0) : term.value;
    if (!Number.isSafeInteger(value)) throw new UsagiError('runtime', '계산 결과가 안전한 정수 범위를 벗어났습니다.', term.location, state);
  }
  return value;
}
