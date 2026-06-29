export default function getMediaDuration(file: File) {
  return new Promise<number>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const media = document.createElement(
      file.type.startsWith("video") ? "video" : "audio",
    );

    media.preload = "metadata";
    media.src = url;

    media.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(media.duration);
    };

    media.onerror = (err) => {
      reject(err);
    };
  });
}
