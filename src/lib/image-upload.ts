"use client";

export const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;
export const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,.heic,.heif";
const ACCEPTED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const OUTPUT_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function isHeic(file: File): boolean {
  return file.type === "image/heic" || file.type === "image/heif" || /\.hei[cf]$/i.test(file.name);
}

export async function prepareImageAttachment(file: File): Promise<{ type: "data"; value: string; mimeType: string }> {
  if (!ACCEPTED_MIME_TYPES.has(file.type) && !/\.(jpe?g|png|webp|hei[cf])$/i.test(file.name)) {
    throw new Error("只支援 JPEG、PNG、WebP 或 HEIC 圖片");
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) throw new Error("圖片原始檔案不可超過 4 MiB");

  let image = file;
  if (isHeic(file)) {
    const { default: heic2any } = await import("heic2any");
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
    if (Array.isArray(converted)) throw new Error("一次只能上傳一張圖片");
    image = new File([converted], `${file.name.replace(/\.hei[cf]$/i, "") || "image"}.jpg`, { type: "image/jpeg" });
  }

  const { default: imageCompression } = await import("browser-image-compression");
  const compressed = await imageCompression(image, { maxSizeMB: 4, useWebWorker: true });
  if (!OUTPUT_MIME_TYPES.has(compressed.type)) throw new Error("不支援的圖片格式");
  if (compressed.size > MAX_IMAGE_SIZE_BYTES) throw new Error("圖片壓縮後仍超過 4 MiB");

  return {
    type: "data",
    value: await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("無法讀取圖片"));
      reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
      reader.readAsDataURL(compressed);
    }),
    mimeType: compressed.type,
  };
}
