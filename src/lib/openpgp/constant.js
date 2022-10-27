export const openpgpStatus = {
  encrypted: 'openpgpStatus/encrypted',
  notLargeFile: 'openpgpStatus/notLargeFile',
  error: 'openpgpStatus/error',
};

export const ENCRYPTION_LIMIT_IN_GIGABYTES = 1;
export const ENCRYPTION_LIMIT_IN_BYTES = ENCRYPTION_LIMIT_IN_GIGABYTES * 1024 * 1024 * 1024;
export const LARGE_FILE_SIZE_IN_BYTES = 100 * 1024 * 1024;
