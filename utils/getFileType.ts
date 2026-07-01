export enum FileType {
  PDF = "PDF",
  DOC = "DOC",
  DOCX = "DOCX",
  PPT = "PPT",
  PPTX = "PPTX",
  XLS = "XLS",
  XLSX = "XLSX",
  TXT = "TXT",
  ZIP = "ZIP",
  RAR = "RAR",
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
  CODE = "CODE",
  OTHER = "OTHER",
}

export function getFileTypeFromMime(mimeType: string): FileType {
  if (!mimeType) return FileType.OTHER;

  const type = mimeType.toLowerCase();

  if (type.includes("pdf")) return FileType.PDF;
  if (type.includes("zip")) return FileType.ZIP;
  if (type.includes("rar")) return FileType.RAR;
  if (type.includes("image")) return FileType.IMAGE;
  if (type.includes("audio")) return FileType.AUDIO;
  if (type.includes("video")) return FileType.VIDEO;
  if (type.includes("text")) return FileType.TXT;
  if (type.includes("msword") || type.includes("doc")) return FileType.DOC;
  if (type.includes("presentation") || type.includes("ppt"))
    return FileType.PPT;
  if (type.includes("spreadsheet") || type.includes("xls")) return FileType.XLS;
  if (
    type.includes("javascript") ||
    type.includes("json") ||
    type.includes("code")
  )
    return FileType.CODE;

  return FileType.OTHER;
}
