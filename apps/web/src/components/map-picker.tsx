"use client";

import dynamic from "next/dynamic";

import { CAMPUS_PLACES, type LatLng } from "./campus-places";

const MapPickerCanvas = dynamic(
  () => import("./map-picker-canvas").then((mod) => mod.MapPickerCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="h-[240px] w-full animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
    ),
  },
);

/**
 * 发布页的选点块：地图点选 + 常用地点快捷选择 + 清除。
 * 只回传坐标，不碰 Task 类型；存字段要等 A 那边的 lat/lng。
 */
export function MapPicker({
  value,
  onChange,
  onPickPlace,
}: {
  value: LatLng | null;
  onChange: (next: LatLng | null) => void;
  onPickPlace?: (name: string) => void;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-800">地图选点（可选）</p>
          <p className="mt-1 text-[11px] leading-4 text-slate-500">
            在地图上点一下，pin 还能拖动微调；不选就按地点文字自动匹配。
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          disabled={!value}
          className="inline-flex h-8 shrink-0 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          清除选点
        </button>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <MapPickerCanvas value={value} onChange={(next) => onChange(next)} />
      </div>

      <div className="mt-3 flex max-w-full min-w-0 gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {CAMPUS_PLACES.map((place) => {
          const active =
            !!value &&
            Math.abs(value.lat - place.coord.lat) < 1e-6 &&
            Math.abs(value.lng - place.coord.lng) < 1e-6;
          return (
            <button
              key={place.name}
              type="button"
              onClick={() => {
                onChange(place.coord);
                onPickPlace?.(place.name);
              }}
              className={
                "shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] transition " +
                (active
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700")
              }
            >
              {place.name}
            </button>
          );
        })}
      </div>

      <p className="mt-2.5 text-[11px] text-slate-500">
        {value
          ? `已选坐标：${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}（GCJ-02）`
          : "未选点 · 地图会按“地点”里的地标自动落点"}
      </p>
    </div>
  );
}
