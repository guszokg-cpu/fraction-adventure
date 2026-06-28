export function resizeImageToBase64(file: File, maxWidth = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const w = Math.min(img.width, maxWidth);
        const h = Math.round((w * img.height) / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.80));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
