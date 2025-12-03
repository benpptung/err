export interface ErrObject extends Error {
  /**
   * Message breadcrumbs added during the error's lifetime.
   */
  msgs: string[];

  /**
   * Context snapshot captured at the moment the error was created,
   * and enriched through OnErr.
   */
  original: Record<string, any>;

  /**
   * Any additional safe properties passed via `props`.
   */
  [key: string]: any;
}

/**
 * Create a new enhanced Error with context and safe custom properties.
 */
export function Err(
  msg?: string,
  original?: Record<string, any> | any,
  props?: Record<string, any> | any
): ErrObject;

/**
 * Enrich an existing error with new context and safe custom properties.
 */
export function OnErr(
  err: any,
  original?: Record<string, any> | any,
  props?: Record<string, any> | any
): ErrObject;
