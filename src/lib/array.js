export async function asyncForEach(arr, callback) {
  if (!arr || !arr.length) {
    return;
  }

  for (let i = 0; i < arr.length; i += 1) {
    await callback(arr[i], i);
  }
}
