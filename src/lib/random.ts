/* eslint-disable no-magic-numbers */
export const random = () => Math.random().toString(16).slice(2, 8);

export const randomNum = (max = 999999, min = 1) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const randomWithType = <T>(data: T[]): T | undefined => {
  if (!data.length) {
    return undefined;
  }

  return data[Math.floor(Math.random() * data.length)];
};

export default {};
