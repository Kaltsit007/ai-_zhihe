import { randomUUID } from "node:crypto";
import { fail, ok } from "@/lib/api/respond";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FILES = 3;
const MAX_FILE_BYTES = 1024 * 1024; // 1MB

const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** 校验文件头魔数，防止伪造 Content-Type 上传非图片文件。 */
function detectImageMime(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  // WebP: "RIFF" .... "WEBP"
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

async function uploadToSupabaseStorage(
  buffer: Buffer,
  mime: string,
  ext: string
): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/+$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const bucket = process.env.SUPABASE_LOST_FOUND_BUCKET || "lost-found";

  const now = new Date();
  const folder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
  const objectPath = `${folder}/${randomUUID()}.${ext}`;
  const endpoint = `${supabaseUrl}/storage/v1/object/${encodeURIComponent(
    bucket
  )}/${objectPath}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": mime,
      "x-upsert": "false",
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Supabase Storage 上传失败（HTTP ${res.status}）${detail ? ": " + detail : ""}`
    );
  }

  return `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(
    bucket
  )}/${objectPath}`;
}

/**
 * 失物招领多图上传接口（双模式自适应）：
 * - 已配置 NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY：上传至 Supabase Storage 公开桶。
 * - 未配置 Supabase：服务端完成白名单与体积校验后返回安全 data URL（兼容 Serverless 只读文件系统）。
 */
export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return fail("BAD_FORM_DATA", "请使用 multipart/form-data 上传图片");
  }

  const entries = [
    ...formData.getAll("files"),
    ...formData.getAll("file"),
  ].filter((item): item is File => item instanceof File);

  if (entries.length === 0) {
    return fail("NO_FILES", "请至少选择 1 张图片");
  }

  if (entries.length > MAX_FILES) {
    return fail(
      "TOO_MANY_FILES",
      `单次最多上传 ${MAX_FILES} 张图片，请删减后重试`
    );
  }

  const useSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const prepared: Array<{ buffer: Buffer; mime: string; ext: string }> = [];

  for (const file of entries) {
    if (file.size <= 0) {
      return fail("EMPTY_FILE", "图片文件为空，请重新选择");
    }
    if (file.size > MAX_FILE_BYTES) {
      return fail(
        "FILE_TOO_LARGE",
        `图片「${file.name || "未命名"}」超过 1MB，请压缩后上传`
      );
    }

    const declaredExt = ALLOWED_MIME_TO_EXT[file.type];
    const buffer = Buffer.from(await file.arrayBuffer());
    const detectedMime = detectImageMime(new Uint8Array(buffer));

    if (!declaredExt || !detectedMime || detectedMime !== file.type) {
      return fail(
        "INVALID_FILE_TYPE",
        "仅支持真实 JPG、PNG 或 WebP 格式图片"
      );
    }

    prepared.push({
      buffer,
      mime: detectedMime,
      ext: ALLOWED_MIME_TO_EXT[detectedMime],
    });
  }

  try {
    if (useSupabase) {
      const urls = await Promise.all(
        prepared.map((item) =>
          uploadToSupabaseStorage(item.buffer, item.mime, item.ext)
        )
      );
      return ok({ urls, storage: "supabase" as const }, 201);
    }

    // 演示 / 无 Supabase 环境变量兜底：返回经魔数与体积校验的 data URL，
    // 兼容 Vercel 只读文件系统与无状态多实例，零磁盘污染。
    const urls = prepared.map(
      (item) => `data:${item.mime};base64,${item.buffer.toString("base64")}`
    );
    return ok({ urls, storage: "demo" as const }, 201);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "图片上传失败，请稍后重试";
    return fail("UPLOAD_FAILED", message, 502);
  }
}
