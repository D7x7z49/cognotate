// packages/core/lib/cache/file.ts

const getFileCache = async <T>(
  path: string,
  validator?: (data: unknown) => data is T,
): Promise<{
  hits: boolean;
  data?: T;
}> => {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    return { hits: false };
  }

  const data = await file.json();
  if (validator && !validator(data)) {
    return { hits: false };
  }

  return { hits: true, data: data as T };
};

const setFileCache = async <T>(path: string, data: T): Promise<void> => {
  const file = Bun.file(path);
  const json = JSON.stringify(data);
  await Bun.write(file, json);
};

export { getFileCache, setFileCache };
