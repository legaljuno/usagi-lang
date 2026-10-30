export interface Location { line: number; column: number }
export type TokenType = 'START' | 'END' | 'PRINT' | 'RAP_PRINT' | 'CHAR_PRINT' | 'IF_ZERO' | 'GOTO' | 'ASSIGN' | 'NUMBER' | 'VARIABLE' | 'MULTIPLY' | 'EOL';
export interface Token { type: TokenType; value: string; location: Location }
export type Term = { kind: 'number' | 'variable'; value: number; location: Location };
/** A multiplication boundary immediately before terms[beforeTerm]. */
export interface Multiplication { beforeTerm: number; location: Location }
export interface Expression { terms: Term[]; multiplications?: Multiplication[] }
export type Opcode = 'ASSIGN' | 'PRINT' | 'RAP_PRINT' | 'CHAR_PRINT' | 'IF_ZERO' | 'GOTO' | 'END';
export interface Instruction { opcode: Opcode; operand: Expression; location: Location; variable?: number }
export interface Program { instructions: Instruction[] }
export interface RuntimeState { pc: number; variables: Map<number, number>; output: string; stepCount: number }
