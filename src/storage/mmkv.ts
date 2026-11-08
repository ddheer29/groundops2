import { createMMKV, MMKV } from 'react-native-mmkv';

let mmkvInstance: MMKV | null = null;
const memoryFallback = new Map<string, string>();

try {
  mmkvInstance = createMMKV({
    id: 'groundops-storage',
  });
} catch (e) {
  console.warn('[Storage] MMKV initialization fallback to in-memory store:', e);
}

export const appStorage = {
  getString: (key: string): string | undefined => {
    try {
      if (mmkvInstance) {
        return mmkvInstance.getString(key);
      }
    } catch {}
    return memoryFallback.get(key);
  },

  set: (key: string, value: string): void => {
    try {
      if (mmkvInstance) {
        mmkvInstance.set(key, value);
        return;
      }
    } catch {}
    memoryFallback.set(key, value);
  },

  delete: (key: string): void => {
    try {
      if (mmkvInstance) {
        mmkvInstance.remove(key);
        return;
      }
    } catch {}
    memoryFallback.delete(key);
  },

  clearAll: (): void => {
    try {
      if (mmkvInstance) {
        mmkvInstance.clearAll();
        return;
      }
    } catch {}
    memoryFallback.clear();
  },
};

export default appStorage;
