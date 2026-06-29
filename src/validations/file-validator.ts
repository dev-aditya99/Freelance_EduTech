export const ALLOWED_RESOURCE_EXTENSIONS = [
  "pdf",

  "doc",
  "docx",

  "ppt",
  "pptx",

  "xls",
  "xlsx",

  "txt",
  "csv",

  "jpg",
  "jpeg",
  "png",
  "webp",

  "mp3",
  "wav",
  "aac",
  "m4a",

  "zip",
  "rar",
  "7z",

  "epub",
  "mobi",
] as const;

export type AllowedResourceExtension =
  (typeof ALLOWED_RESOURCE_EXTENSIONS)[number];

export function isAllowedResourceFile(file: File | string): boolean {
  let extension = "";

  if (typeof file === "string") {
    extension = file.split(".").pop()?.toLowerCase() || "";
  } else {
    extension = file.name.split(".").pop()?.toLowerCase() || "";
  }

  return ALLOWED_RESOURCE_EXTENSIONS.includes(
    extension as AllowedResourceExtension,
  );
}
