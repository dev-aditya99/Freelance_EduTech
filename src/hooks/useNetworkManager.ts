"use client";

import { useState, useCallback, useRef } from "react";

export type NetworkStatus =
  | "idle"
  | "running"
  | "success"
  | "error"
  | "cancelled";

export interface NetworkState<T = any> {
  progress: number;
  status: NetworkStatus;
  data?: T;
  error?: string;
}

export interface RequestConfig {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  data?: File | FormData | Record<string, any> | null;
  headers?: Record<string, string>;
  responseType?: XMLHttpRequestResponseType;
}

export function useNetworkManager() {
  const [tasks, setTasks] = useState<Record<string, NetworkState>>({});
  const xhrRefs = useRef<Record<string, XMLHttpRequest>>({});

  const getProgress = useCallback(
    (id: string) => tasks[id]?.progress || 0,
    [tasks],
  );
  const getStatus = useCallback(
    (id: string) => tasks[id]?.status || "idle",
    [tasks],
  );
  const getData = useCallback((id: string) => tasks[id]?.data || null, [tasks]);

  const executeProcess = useCallback(
    (id: string, config: RequestConfig): Promise<any> => {
      return new Promise((resolve, reject) => {
        setTasks((prev) => ({
          ...prev,
          [id]: { progress: 0, status: "running" },
        }));

        const xhr = new XMLHttpRequest();
        xhrRefs.current[id] = xhr;

        if (config.responseType) {
          xhr.responseType = config.responseType;
        }

        const isUpload = ["POST", "PUT", "PATCH"].includes(config.method);

        // Upload Progress
        if (isUpload && xhr.upload) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              setTasks((prev) => ({
                ...prev,
                [id]: { ...prev[id], progress, status: "running" },
              }));
            }
          };
        }

        // Download Progress (For GET)
        if (config.method === "GET") {
          xhr.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              setTasks((prev) => ({
                ...prev,
                [id]: { ...prev[id], progress, status: "running" },
              }));
            }
          };
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            let responseData = xhr.response;
            if (xhr.responseType === "" || xhr.responseType === "text") {
              try {
                responseData = JSON.parse(xhr.responseText);
              } catch (e) {
                // Not JSON
              }
            }

            setTasks((prev) => ({
              ...prev,
              [id]: { progress: 100, status: "success", data: responseData },
            }));
            delete xhrRefs.current[id];
            resolve(responseData);
          } else {
            setTasks((prev) => ({
              ...prev,
              [id]: { ...prev[id], status: "error", error: xhr.statusText },
            }));
            delete xhrRefs.current[id];
            reject(new Error(`Failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          setTasks((prev) => ({
            ...prev,
            [id]: { ...prev[id], status: "error", error: "Network Error" },
          }));
          delete xhrRefs.current[id];
          reject(new Error("Network Error"));
        };

        xhr.onabort = () => {
          setTasks((prev) => ({
            ...prev,
            [id]: { ...prev[id], status: "cancelled", error: "Cancelled" },
          }));
          delete xhrRefs.current[id];
          reject(new Error("Cancelled"));
        };

        xhr.open(config.method, config.url);

        // Header Handling
        if (config.headers) {
          Object.entries(config.headers).forEach(([key, val]) =>
            xhr.setRequestHeader(key, val),
          );
        }

        // Data Handling
        if (config.data instanceof FormData || config.data instanceof File) {
          xhr.send(config.data);
        } else if (config.data && typeof config.data === "object") {
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.send(JSON.stringify(config.data));
        } else {
          xhr.send();
        }
      });
    },
    [],
  );

  const cancel = useCallback((id: string) => {
    if (xhrRefs.current[id]) {
      xhrRefs.current[id].abort();
      delete xhrRefs.current[id];
    }
  }, []);

  const clearState = useCallback((id: string) => {
    setTasks((prev) => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  }, []);

  return {
    executeProcess,
    cancel,
    getProgress,
    getStatus,
    getData,
    clearState,
  };
}
