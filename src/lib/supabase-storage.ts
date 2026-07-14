export const STORAGE_KEY_LEMBRAR = "sb-lembrar-conectado";

export function backingStorage(): Storage {
  return localStorage.getItem(STORAGE_KEY_LEMBRAR) === "false" ? sessionStorage : localStorage;
}

export const storageAdaptavel = {
  getItem: (key: string) => backingStorage().getItem(key),
  setItem: (key: string, value: string) => backingStorage().setItem(key, value),
  removeItem: (key: string) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};
