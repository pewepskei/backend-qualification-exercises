export type Value = string | number | boolean | null | undefined |
  Date | Buffer | Map<unknown, unknown> | Set<unknown> |
  Array<Value> | { [key: string]: Value };

/**
 * Transforms JavaScript scalars and objects into JSON
 * compatible objects.
 */
export function serialize(value: Value): unknown {
  // console.log("Value being serialized ", value);
  if (value instanceof Date)
    return { __t: "Date", __v: value.getTime() };

  if (Buffer.isBuffer(value))
    return { __t: "Buffer", __v: [...value] };

  if (value instanceof Map)
    return { __t: "Map", __v: [...value].map(([k, v]: [Value, Value]) => [serialize(k), serialize(v)]) };

  if (value instanceof Set)
    return { __t: "Set", __v: [...value].map((v: Value) => serialize(v)) };

  if (Array.isArray(value))
    return value.map(v => serialize(v));

  if (value && typeof value === "object") {
    // recurse into plain object
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, serialize(v as Value)])
    );
  }

  return value; // primitives + undefined
}

/**
 * Transforms JSON compatible scalars and objects into JavaScript
 * scalar and objects.
 */
export function deserialize<T = unknown>(value: unknown): T {
  if (Array.isArray(value))
    return value.map(v => deserialize(v)) as T;

  if (value && typeof value === "object") {
    const { __t, __v } = value as any;

    if (__t === "Date") return new Date(__v) as T;
    if (__t === "Buffer") return Buffer.from(__v) as T;
    if (__t === "Map")
      return new Map(__v.map(([k, v]: [unknown, unknown]) => [deserialize(k), deserialize(v)])) as T;
    if (__t === "Set")
      return new Set(__v.map((v: unknown) => deserialize(v))) as T;

    // recurse into plain object
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, deserialize(v)])
    ) as T;
  }

  return value as T; // primitives + undefined
}
