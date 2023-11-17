import type { ErrorWithMeta } from 'clipanion';

export class AppError extends Error implements ErrorWithMeta {
  clipanion = { type: 'none' as const };
}
