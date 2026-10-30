import type { Expression, RuntimeState } from './ast.js';
import { UsagiError } from './errors.js';

export function evaluate(expression: Expression, state: RuntimeState): number {
  let sum = 0;
  let product: number | undefined;
  let previousOperator: { line: number; column: number } | undefined;
  let boundaryIndex = 0;
  const boundaries = expression.multiplications ?? [];

  for (let index = 0; index < expression.terms.length; index++) {
    const boundary = boundaries[boundaryIndex];
    if (boundary?.beforeTerm === index) {
      if (product === undefined) product = sum;
      else {
        product *= sum;
        if (!Number.isSafeInteger(product)) throw new UsagiError('runtime', '계산 결과가 안전한 정수 범위를 벗어났습니다.', previousOperator!, state);
      }
      previousOperator = boundary.location;
      boundaryIndex++;
      sum = 0;
    }
    const term = expression.terms[index];
    sum += term.kind === 'variable' ? (state.variables.get(term.value) ?? 0) : term.value;
    if (!Number.isSafeInteger(sum)) throw new UsagiError('runtime', '계산 결과가 안전한 정수 범위를 벗어났습니다.', term.location, state);
  }
  if (product === undefined) return sum;
  product *= sum;
  if (!Number.isSafeInteger(product)) throw new UsagiError('runtime', '계산 결과가 안전한 정수 범위를 벗어났습니다.', previousOperator!, state);
  return product;
}
