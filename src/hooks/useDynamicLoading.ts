"use client";

import { useState, useCallback } from "react";

export function useDynamicLoading() {
  // Ye object saari keys ka loading state store karega: { "fetch_data": true, "delete_item_1": false }
  const [loaders, setLoaders] = useState<Record<string, boolean>>({});

  const startLoading = useCallback((key: string) => {
    setLoaders((prev) => ({ ...prev, [key]: true }));
  }, []);

  const stopLoading = useCallback((key: string) => {
    setLoaders((prev) => ({ ...prev, [key]: false }));
  }, []);

  // Check karne ke liye ki specific key loading me hai ya nahi
  const isLoading = useCallback(
    (key: string) => {
      return !!loaders[key]; // returns true/false
    },
    [loaders],
  );

  // 🔥 THE MAGIC WRAPPER 🔥
  // Ye apne aap start aur stop handle karega bina try-catch likhe
  const withLoading = useCallback(
    async <T>(key: string, asyncFn: () => Promise<T>): Promise<T> => {
      startLoading(key);
      try {
        return await asyncFn();
      } finally {
        stopLoading(key);
      }
    },
    [startLoading, stopLoading],
  );

  // Agar page pe kuch bhi load ho raha ho (Global overlay ke liye useful hai)
  const isAnyLoading = Object.values(loaders).some(Boolean);

  return { startLoading, stopLoading, isLoading, withLoading, isAnyLoading };
}
