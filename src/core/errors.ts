import type { Location, RuntimeState } from './ast.js';

export class UsagiError extends Error {
  readonly kind: 'syntax' | 'runtime';
  readonly location: Location;
  readonly state?: RuntimeState;

  constructor(kind: 'syntax' | 'runtime', message: string, location: Location, state?: RuntimeState) {
    super(`${kind === 'syntax' ? '문법 오류' : '실행 오류'} (${location.line}행 ${location.column}열): ${message}`);
    this.name = 'UsagiError';
    this.kind = kind;
    this.location = location;
    this.state = state;
  }
}
