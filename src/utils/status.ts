export const isActive = (status: unknown): boolean =>
  status === true || status === 1 || status === "1";

export const toTinyint = (flag: unknown): 0 | 1 =>
  flag === true || flag === 1 || flag === "1" ? 1 : 0;
