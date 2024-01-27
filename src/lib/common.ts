const camelToSnake = (str: string) =>
  str.replace(/[A-Z]/g, (l, index) => {
    return index == 0 ? l.toLowerCase() : "_" + l.toLowerCase();
  });

export const snakifyKeys = (obj: Record<string, any>) => {
  if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
    Object.keys(obj).forEach((key) => {
      const v = obj[key];
      const cv = snakifyKeys(v);
      const newKey = camelToSnake(key);
      obj[newKey] = cv;
      if (newKey !== key) {
        delete obj[key];
      }
    });
  }
  return obj;
};
