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
   * Append a message to msgs[].
   */
  m(message: string): this;

  /**
   * Attach flags to the error. Same as the flag_dict parameter.
   */
  f(flag_dict: Record<string, any> | string): this;

  /**
   * Merge context into original. Same as the context_dict parameter.
   */
  c(context_dict: Record<string, any>): this;

  /**
   * Any additional safe properties passed via `flag_dict`.
   */
  [key: string]: any;
}

/**
 * Create a new enhanced Error with context and safe custom properties.
 */
export function Err(
  msg?: string,
  context_dict?: Record<string, any>,
  flag_dict?: Record<string, any> | string
): ErrObject;

/**
 * Enrich an existing error with new context and safe custom properties.
 */
export function OnErr(
  err: any,
  context_dict?: Record<string, any>,
  flag_dict?: Record<string, any> | string
): ErrObject;
