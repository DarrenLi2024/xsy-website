import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest, unauthorized, ok, badRequest, serverError } from "@/lib/admin-api";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".pdf",
]);

function sanitizeFilename(name: string): string {
  // Remove path traversal, keep extension
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")).toLowerCase() : "";
  const safeName = randomUUID() + ext;
  return safeName;
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return badRequest("请求必须为 multipart/form-data 格式");
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return badRequest("缺少上传文件");
  }

  // File type validation
  if (!ALLOWED_TYPES.has(file.type)) {
    return badRequest(`不支持的文件类型: ${file.type}，仅支持 PNG / JPEG / WebP / GIF / SVG / PDF`);
  }

  // File size validation
  if (file.size > MAX_FILE_SIZE) {
    return badRequest(`文件大小超过 10MB 限制`);
  }

  // Extension validation (defense in depth)
  const originalName = file.name || "file";
  const ext = originalName.includes(".") ? originalName.slice(originalName.lastIndexOf(".")).toLowerCase() : "";
  if (ext && !ALLOWED_EXTENSIONS.has(ext)) {
    return badRequest(`不支持的文件扩展名: ${ext}`);
  }

  // Read file content
  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch {
    return serverError("读取文件失败");
  }

  // Ensure upload directory exists
  const uploadDir = join(process.cwd(), "public", "uploads");
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch {
    return serverError("创建上传目录失败");
  }

  // Save file
  const filename = sanitizeFilename(originalName);
  const filepath = join(uploadDir, filename);
  try {
    await writeFile(filepath, new Uint8Array(buffer));
  } catch {
    return serverError("保存文件失败");
  }

  const url = `/uploads/${filename}`;
  return ok({ url, filename, size: file.size });
}

export async function DELETE(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const filename = (json as any)?.filename;
  if (!filename || typeof filename !== "string") {
    return badRequest("缺少文件名参数");
  }

  // Security: prevent path traversal
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return badRequest("无效的文件名");
  }

  const filepath = join(process.cwd(), "public", "uploads", filename);
  const { unlink } = await import("fs/promises");
  try {
    await unlink(filepath);
  } catch {
    // File may not exist, that's ok
  }

  return ok({ deleted: true });
}
