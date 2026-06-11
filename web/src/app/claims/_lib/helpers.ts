export const isValidHttpUrl = (str: string): boolean => {
  if (!str) return false;
  try {
    const newUrl = new URL(str);
    return newUrl.protocol === "http:" || newUrl.protocol === "https:";
  } catch (err) {
    return false;
  }
};
