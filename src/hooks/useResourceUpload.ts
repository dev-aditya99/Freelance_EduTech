"use client";

import { useState, useCallback, useRef } from "react";

export type UploadStatus =
  | "idle"
  | "uploading"
  | "success"
  | "error"
  | "cancelled";

export interface UploadState {
  progress: number;
  status: UploadStatus;
}

export function useUploader() {
  const [uploads, setUploads] = useState<Record<string, UploadState>>({});
  const xhrRefs = useRef<Record<string, XMLHttpRequest>>({});

  const getProgress = useCallback(
    (id: string) => uploads[id]?.progress || 0,
    [uploads],
  );
  const getStatus = useCallback(
    (id: string) => uploads[id]?.status || "idle",
    [uploads],
  );

  const uploadFile = useCallback(
    (id: string, uploadUrl: string, file: File): Promise<void> => {
      return new Promise((resolve, reject) => {
        setUploads((prev) => ({
          ...prev,
          [id]: { progress: 0, status: "uploading" },
        }));

        const xhr = new XMLHttpRequest();
        xhrRefs.current[id] = xhr;

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          const progress = Math.round((event.loaded / event.total) * 100);

          setUploads((prev) => ({
            ...prev,
            [id]: { ...prev[id], progress, status: "uploading" },
          }));
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploads((prev) => ({
              ...prev,
              [id]: { progress: 100, status: "success" },
            }));
            delete xhrRefs.current[id];
            resolve();
          } else {
            setUploads((prev) => ({
              ...prev,
              [id]: { progress: uploads[id]?.progress || 0, status: "error" },
            }));
            delete xhrRefs.current[id];
            reject(new Error(`Failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          setUploads((prev) => ({
            ...prev,
            [id]: { progress: uploads[id]?.progress || 0, status: "error" },
          }));
          delete xhrRefs.current[id];
          reject(new Error("Network Error"));
        };

        xhr.onabort = () => {
          setUploads((prev) => ({
            ...prev,
            [id]: { progress: uploads[id]?.progress || 0, status: "cancelled" },
          }));
          delete xhrRefs.current[id];
          reject(new Error("Upload Cancelled"));
        };

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    },
    [uploads],
  );

  const cancelUpload = useCallback((id: string) => {
    if (xhrRefs.current[id]) {
      xhrRefs.current[id].abort();
      delete xhrRefs.current[id];
    }
  }, []);

  const clearUploadState = useCallback((id: string) => {
    setUploads((prev) => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  }, []);

  return {
    uploadFile,
    cancelUpload,
    getProgress,
    getStatus,
    clearUploadState,
  };
}
