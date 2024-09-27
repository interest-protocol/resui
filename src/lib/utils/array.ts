
export const chunk = <T = unknown>(
  list: ReadonlyArray<T>,
  length: number
): ReadonlyArray<ReadonlyArray<T>> => [
  list.slice(0, length),
  ...(list.length > length ? chunk(list.slice(length), length) : []),
];
