
type ElementOf<T> = T extends (infer E)[] ? E : never;
type Extend<T, E> = T extends E ? E : never;
type EnsureString<T> = T extends string ? string : never;
