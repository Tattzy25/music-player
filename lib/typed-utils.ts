export type ExtractOption<TOptions> = TOptions extends readonly (infer T)[]
  ? T extends { options: readonly (infer O)[] }
    ? O
    : T
  : never;

/**
 * Extract the value type from options based on the valueKey.
 * Handles both flat options and grouped options.
 *
 * @example
 * ```ts
 * type Options = readonly [{ value: "apple" }, { value: "banana" }];
 * type Value = ExtractOptionValue<Options, "value">; // "apple" | "banana"
 *
 * // With custom key
 * type CustomOptions = readonly [{ id: 1 }, { id: 2 }];
 * type CustomValue = ExtractOptionValue<CustomOptions, "id">; // 1 | 2
 * ```
 */
export type ExtractOptionValue<
  TOptions,
  TValueKey extends string,
> = ExtractOption<TOptions> extends infer O
  ? O extends Record<string, unknown>
    ? TValueKey extends keyof O
      ? O[TValueKey] & {}
      : never
    : never
  : never;
