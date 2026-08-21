
export type LogScope = 'app' | 'api' | 'worker';
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface Logger {
  error: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  debug: (message: string, ...args: unknown[]) => void;
}

const log = (scope: LogScope, level: LogLevel, message: string, ...args: unknown[]): void => {
  console[level](`[${scope}] ${message}`, ...args);
};
export const getLogger = (scope: LogScope): Logger => ({
  error: (message: string, ...args: unknown[]): void => log(scope, 'error', message, ...args),
  warn: (message: string, ...args: unknown[]): void => log(scope, 'warn', message, ...args),
  info: (message: string, ...args: unknown[]): void => log(scope, 'info', message, ...args),
  debug: (message: string, ...args: unknown[]): void => log(scope, 'debug', message, ...args),
});
export const logger = getLogger('app');
