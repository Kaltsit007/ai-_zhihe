/**
 * 前端浏览器图片校验与自适应 Canvas 压缩工具。
 * 规则：白名单 JPG/PNG/WebP，单张压缩至 <= 1MB，最大边长 1600px。
 */

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_LOST_FOUND_IMAGES = 3;
export const MAX_IMAGE_BYTES = 1024 * 1024; // 1MB
const MAX_RAW_INPUT_BYTES = 20 * 1024 * 1024; // 20MB 异常巨图保护
const MAX_DIMENSION = 1600;

export function isAllowedImageType(mime: string): boolean {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(mime);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("图片解码失败，请更换一张有效图片"));
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("图片压缩失败，请尝试换一张图片"));
          return;
        }
        resolve(blob);
      },
      mime,
      quality
    );
  });
}

function replaceFileExt(filename: string, mime: string): string {
  const ext =
    mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  const base = filename.replace(/\.[^.]+$/, "") || "photo";
  return `${base}.${ext}`;
}

export interface CompressedImageResult {
  file: File;
  originalSize: number;
  compressedSize: number;
}

export async function compressLostFoundImage(
  file: File
): Promise<CompressedImageResult> {
  if (!isAllowedImageType(file.type)) {
    throw new Error(
      `不支持「${file.name}」的格式，请上传 JPG、PNG 或 WebP 图片`
    );
  }

  if (file.size <= 0) {
    throw new Error(`图片「${file.name}」为空文件`);
  }

  if (file.size > MAX_RAW_INPUT_BYTES) {
    throw new Error(
      `图片「${file.name}」体积超过 20MB，请先裁剪后再上传`
    );
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const naturalW = img.naturalWidth || img.width;
    const naturalH = img.naturalHeight || img.height;

    if (!naturalW || !naturalH) {
      throw new Error(`无法读取「${file.name}」的图像尺寸`);
    }

    // 已经足够小且尺寸适中，直接沿用原文件
    if (
      file.size <= MAX_IMAGE_BYTES &&
      naturalW <= MAX_DIMENSION &&
      naturalH <= MAX_DIMENSION
    ) {
      return {
        file,
        originalSize: file.size,
        compressedSize: file.size,
      };
    }

    let scale = Math.min(1, MAX_DIMENSION / Math.max(naturalW, naturalH));
    // PNG 若超 1MB 用 JPEG 压缩以获得更高压缩比；WebP/JPEG 保持原格式
    const targetMime =
      file.type === "image/png" ? "image/jpeg" : file.type;
    const qualities = [0.85, 0.72, 0.6, 0.48, 0.38];

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("当前浏览器不支持 Canvas 图片压缩");
    }

    let bestBlob: Blob | null = null;

    for (let round = 0; round < 3; round += 1) {
      const width = Math.max(1, Math.round(naturalW * scale));
      const height = Math.max(1, Math.round(naturalH * scale));
      canvas.width = width;
      canvas.height = height;

      if (targetMime === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
      ctx.drawImage(img, 0, 0, width, height);

      for (const quality of qualities) {
        const blob = await canvasToBlob(canvas, targetMime, quality);
        bestBlob = blob;
        if (blob.size <= MAX_IMAGE_BYTES) {
          const outFile = new File([blob], replaceFileExt(file.name, targetMime), {
            type: targetMime,
            lastModified: Date.now(),
          });
          return {
            file: outFile,
            originalSize: file.size,
            compressedSize: outFile.size,
          };
        }
      }

      scale *= 0.72;
    }

    if (bestBlob && bestBlob.size <= MAX_IMAGE_BYTES) {
      const outFile = new File([bestBlob], replaceFileExt(file.name, targetMime), {
        type: targetMime,
        lastModified: Date.now(),
      });
      return {
        file: outFile,
        originalSize: file.size,
        compressedSize: outFile.size,
      };
    }

    throw new Error(`图片「${file.name}」压缩后仍超过 1MB，请裁剪后再试`);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
