export async function asyncForEach(arr, callback) {
  if (!arr || !arr.length) {
    return;
  }

  for (let i = 0; i < arr.length; i += 1) {
    await callback(arr[i], i);
  }
}

export function randomiseArray(arr) {
  const newArr = arr.slice();

  for (let i = newArr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i);
    const temp = newArr[i];
    newArr[i] = newArr[j];
    newArr[j] = temp;
  }

  return newArr;
}

export const sortKeys = { mtime: 'mtime', name: 'name', random: 'random' };

export function sortWith(arr, sortKey) {
  if (!arr?.length) {
    return arr;
  }

  switch (sortKey) {
    case sortKeys.mtime:
      return arr.sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime());
    case sortKeys.name:
      return arr.sort((a, b) => (a.name > b.name ? 1 : -1));
    case sortKeys.random:
      return randomiseArray(arr);
    default:
      return arr;
  }
}
