"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";

export interface AsyncOptions<T, E = any> {
  showToast?: boolean;
  showConsole?: boolean;
  successMsg?: string | ((data: T) => string);
  errorMsg?: string | ((error: E) => string);
  onSuccess?: (data: T) => void;
  onError?: (error: E) => void;
  throwError?: boolean;
  loadingKey?: string;
}

export function useAsyncHandler<T = any, E = any>() {
  const [loaders, setLoaders] = useState<Record<string, boolean>>({});

  const startLoading = useCallback((key: string) => {
    setLoaders((prev) => ({ ...prev, [key]: true }));
  }, []);

  const stopLoading = useCallback((key: string) => {
    setLoaders((prev) => ({ ...prev, [key]: false }));
  }, []);

  const isLoading = useCallback((key: string) => !!loaders[key], [loaders]);

  const execute = useCallback(
    async (
      asyncFunction: () => Promise<T>,
      options?: AsyncOptions<T, E>,
    ): Promise<T | null> => {
      const key = options?.loadingKey || "default";

      startLoading(key);

      try {
        const result = await asyncFunction();

        if (options?.showConsole) {
          console.log(result);
        }

        if (options?.showToast) {
          const message =
            typeof options.successMsg === "function"
              ? options.successMsg(result)
              : options.successMsg || "Success!";
          toast.success(message);
        }

        if (options?.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (err: any) {
        if (options?.showConsole) {
          console.error(err);
        }

        if (options?.showToast) {
          const fallbackMsg =
            err?.response?.data?.message || err.message || "Error occurred!";
          const message =
            typeof options.errorMsg === "function"
              ? options.errorMsg(err)
              : options.errorMsg || fallbackMsg;
          toast.error(message);
        }

        if (options?.onError) {
          options.onError(err);
        }

        if (options?.throwError) {
          throw err;
        }

        return null;
      } finally {
        stopLoading(key);
      }
    },
    [startLoading, stopLoading],
  );

  return { execute, isLoading };
}
