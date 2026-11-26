"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icon";
import {
  apiCreateLostFound,
  apiUploadLostFoundImages,
} from "@/lib/api-client";
import {
  ALLOWED_IMAGE_TYPES,
  compressLostFoundImage,
  MAX_LOST_FOUND_IMAGES,
} from "@/lib/image-compress";
import type { LostFound, LostFoundType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface UploadedPreview {
  id: string;
  url: string;
  name: string;
  sizeKB: number;
}

export function LostFoundForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [type, setType] = useState<LostFoundType>("lost");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");

  const [images, setImages] = useState<UploadedPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<LostFound | null>(null);

  async function processFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;

    setUploadError(null);

    const remaining = MAX_LOST_FOUND_IMAGES - images.length;
    if (remaining <= 0) {
      setUploadError(`最多只能上传 ${MAX_LOST_FOUND_IMAGES} 张图片，请先删除不需要的图片`);
      return;
    }

    let selected = incoming;
    if (incoming.length > remaining) {
      selected = incoming.slice(0, remaining);
      setUploadError(
        `每条最多 ${MAX_LOST_FOUND_IMAGES} 张图片，已自动选取前 ${remaining} 张`
      );
    }

    setUploading(true);
    setUploadStatus(`正在压缩 ${selected.length} 张图片…`);

    const compressedFiles: Array<{ file: File; name: string; sizeKB: number }> = [];
    try {
      for (let i = 0; i < selected.length; i += 1) {
        setUploadStatus(`正在压缩第 ${i + 1}/${selected.length} 张图片…`);
        const res = await compressLostFoundImage(selected[i]);
        compressedFiles.push({
          file: res.file,
          name: selected[i].name,
          sizeKB: Math.max(1, Math.round(res.compressedSize / 1024)),
        });
      }

      setUploadStatus("正在上传至服务器…");
      const uploadRes = await apiUploadLostFoundImages(
        compressedFiles.map((item) => item.file)
      );

      if (uploadRes.error || !uploadRes.data) {
        setUploadError(uploadRes.error?.message ?? "图片上传失败，请重试");
        return;
      }

      const urls = uploadRes.data.urls;
      const appended: UploadedPreview[] = urls.map((url, idx) => ({
        id: `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        url,
        name: compressedFiles[idx]?.name ?? `图片 ${idx + 1}`,
        sizeKB: compressedFiles[idx]?.sizeKB ?? 0,
      }));

      setImages((prev) => [...prev, ...appended].slice(0, MAX_LOST_FOUND_IMAGES));
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "图片处理失败，请检查文件格式"
      );
    } finally {
      setUploading(false);
      setUploadStatus(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      void processFiles(event.target.files);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    if (event.dataTransfer.files) {
      void processFiles(event.dataTransfer.files);
    }
  }

  function removeImage(id: string) {
    setImages((prev) => prev.filter((item) => item.id !== id));
    setUploadError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploading) return;

    setPending(true);
    setError(null);
    setCreated(null);

    const formattedTime = time
      ? time.replace("T", " ")
      : "刚刚";

    const result = await apiCreateLostFound({
      type,
      title,
      location,
      time: formattedTime,
      description,
      contact,
      images: images.map((item) => item.url),
    });
    setPending(false);

    if (result.error || !result.data) {
      setError(result.error?.message ?? "提交失败，请稍后重试");
      return;
    }

    setCreated(result.data);
    setTitle("");
    setLocation("");
    setTime("");
    setDescription("");
    setContact("");
    setImages([]);
    setUploadError(null);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]"
    >
      <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Lost & found
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              提交失物 / 拾物信息
            </h2>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            支持实拍多图
          </span>
        </div>

        {created ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <div className="flex items-center gap-2 font-medium">
              <Icon name="check" className="h-4 w-4" />
              提交成功：{created.title}
            </div>
            <p className="mt-1.5 text-xs leading-5 text-emerald-700">
              条目已发布至失物招领广场，并将在 20:00 进入未解决失物群汇总（认领后自动移出）。
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/lost-found/${created.id}`}
                className="inline-flex h-9 items-center rounded-xl bg-[#0f5132] px-3.5 text-xs font-medium text-white transition hover:bg-[#0b3f27]"
              >
                查看条目详情
              </Link>
              <Link
                href="/lost-found"
                className="inline-flex h-9 items-center rounded-xl border border-emerald-200 bg-white px-3.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
              >
                返回失物招领列表
              </Link>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-2">
          {[
            { key: "lost", label: "我丢了（寻物）", icon: "search" as const },
            { key: "found", label: "我捡到（招领）", icon: "check" as const },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setType(item.key as LostFoundType)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-medium transition",
                type === item.key
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              <Icon name={item.icon} className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-xs font-medium text-slate-700">
              物品名称（必填）
            </span>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="例如：黑色耳机盒 / 蓝色雨伞 / 校园卡"
            />
          </label>

          <label>
            <span className="text-xs font-medium text-slate-700">
              地点（必填）
            </span>
            <input
              required
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={100}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="例如：南湖图书馆二楼 / 博学楼 A 座"
            />
          </label>

          <label>
            <span className="text-xs font-medium text-slate-700">
              发生时间（选填）
            </span>
            <input
              type="datetime-local"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="text-xs font-medium text-slate-700">
              物品特征描述（必填）
            </span>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={1000}
              className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="写清楚颜色、型号、贴纸或挂件等特征；捡到证件请隐藏学号/证件号以便当面核对。"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="text-xs font-medium text-slate-700">
              联系方式（必填，站内展示方便快速对接）
            </span>
            <input
              required
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              maxLength={100}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="例如：微信 xxx / QQ xxx"
            />
          </label>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-700">
                物品实拍图（选填，最多 {MAX_LOST_FOUND_IMAGES} 张）
              </span>
              <span className="text-xs text-slate-400">
                已上传 {images.length} / {MAX_LOST_FOUND_IMAGES} 张
              </span>
            </div>

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={cn(
                "mt-1.5 rounded-2xl border-2 border-dashed p-5 text-center transition",
                dragActive
                  ? "border-emerald-500 bg-emerald-50/70"
                  : "border-slate-200 bg-slate-50/70 hover:border-emerald-300",
                images.length >= MAX_LOST_FOUND_IMAGES && "opacity-75"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                multiple
                disabled={uploading || images.length >= MAX_LOST_FOUND_IMAGES}
                onChange={handleFileChange}
                className="hidden"
                id="lost-found-image-input"
              />

              <label
                htmlFor="lost-found-image-input"
                className={cn(
                  "flex flex-col items-center justify-center gap-2",
                  uploading || images.length >= MAX_LOST_FOUND_IMAGES
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                )}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200/80">
                  <Icon name="plus" className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium text-slate-700">
                  {uploading
                    ? uploadStatus ?? "图片处理中…"
                    : images.length >= MAX_LOST_FOUND_IMAGES
                    ? "已达到 3 张上限，可删除后重新上传"
                    : "点击选择图片，或将图片拖拽到此处"}
                </span>
                <span className="text-xs text-slate-400">
                  选填，最多 3 张，支持 JPG / PNG / WebP，自动压缩至 1MB 内，证件敏感信息请先打码
                </span>
              </label>
            </div>

            {uploadError ? (
              <div className="mt-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs text-rose-700">
                {uploadError}
              </div>
            ) : null}

            {images.length > 0 ? (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.name}
                      className="h-28 w-full object-cover"
                    />
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-slate-900/70 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
                      图 {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      aria-label={`删除第 ${index + 1} 张图片`}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/75 text-white transition hover:bg-rose-600"
                    >
                      <Icon name="close" className="h-3.5 w-3.5" />
                    </button>
                    <div className="truncate border-t border-slate-100 bg-white px-2 py-1 text-[11px] text-slate-500">
                      {img.sizeKB > 0 ? `${img.sizeKB} KB` : img.name}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <Link
            href="/lost-found"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={pending || uploading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0f5132] px-5 text-sm font-medium text-white shadow-sm transition hover:bg-[#0b3f27] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon name="plus" className="h-4 w-4" />
            {pending ? "提交中…" : uploading ? "等待图片上传…" : "提交发布"}
          </button>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Icon name="bot" className="h-4 w-4 text-emerald-700" />
            会进入机器人汇总
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            每天 20:00，机器人会把当天新增和未解决条目汇总发到校园群；已认领或已关闭的条目会自动排除。
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Icon name="shield" className="h-4 w-4 text-emerald-700" />
            拍照与隐私提醒
          </div>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
            <li>群机器人每日汇总不公开联系方式，请在站内查看并核对物品特征。</li>
            <li>拍校园卡、身份证、银行卡等证件时，务必先对卡号与人脸打码。</li>
            <li>前端会自动将单张图片压缩至 1MB 以内，最多可上传 3 张。</li>
            <li>找回或认领完成后，请到详情页点击「标为已认领」。</li>
          </ul>
        </div>
      </aside>
    </form>
  );
}
