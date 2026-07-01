import {
  File,
  FileText,
  FileArchive,
  FileImage,
  FileCode,
  FileMusic,
  FileVideo,
} from "lucide-react";
import { FileType } from "./getFileType";

export function getFileIcon(type: FileType) {
  switch (type) {
    case FileType.PDF:
    case FileType.DOC:
    case FileType.DOCX:
    case FileType.PPT:
    case FileType.PPTX:
    case FileType.XLS:
    case FileType.XLSX:
    case FileType.TXT:
      return <FileText size={28} className="text-indigo-500" />;

    case FileType.ZIP:
    case FileType.RAR:
      return <FileArchive size={28} className="text-amber-500" />;

    case FileType.IMAGE:
      return <FileImage size={28} className="text-emerald-500" />;

    case FileType.CODE:
      return <FileCode size={28} className="text-blue-500" />;

    case FileType.AUDIO:
      return <FileMusic size={28} className="text-purple-500" />;

    case FileType.VIDEO:
      return <FileVideo size={28} className="text-red-500" />;

    default:
      return <File size={28} className="text-slate-500" />;
  }
}
