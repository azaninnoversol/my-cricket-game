export const generateToken = (length: number = 32) => {
  const chars = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890`;
  let token = "";
  for (let index = 0; index < length; index++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

type StorageKey = string;

export const localStorageHelper = {
  setItem: (key: StorageKey, value: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },

  getItem: <T = any>(key: StorageKey): T | null => {
    if (typeof window !== "undefined") {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    }
    return null;
  },

  removeItem: (key: StorageKey) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  },

  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  },
};
