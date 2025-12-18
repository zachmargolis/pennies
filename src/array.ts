export function last<T>(arr: Array<T>): T {
  return arr[arr.length - 1];
}

export function slices<T>(sliceSize: number, arr: Array<T>): T[][] {
  const result = [];
  for (let idx = 0; idx < Math.ceil(arr.length / sliceSize); idx++) {
    result.push(arr.slice(idx * sliceSize, (idx + 1) * sliceSize));
  }
  return result;
}
