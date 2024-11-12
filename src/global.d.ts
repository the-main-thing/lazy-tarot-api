declare type NonEmptyArray<T> = [T, ...Array<T>]
declare type SomeArray<T> = Array<T> | ReadonlyArray<T>
declare type AnObject<T = any> = Record<PropertyKey, T>

