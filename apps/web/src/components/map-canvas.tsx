"use client";

import "leaflet/dist/leaflet.css";
import "./map-canvas.css";

import L from "leaflet";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { statusMeta } from "@/lib/meta";
import type { Task, TaskCategory } from "@/lib/types";

import {
  CAMPUS_CENTER,
  CAMPUS_DEFAULT_ZOOM,
  clampToCampus,
  readTaskCoord,
  resolveTaskCoord,
  spreadCoord,
  type LatLng,
} from "./campus-places";
import { activeTile } from "./map-tiles";

/** 分类颜色，和 meta.ts 里的 Tailwind 色板对齐（这里要写十六进制，divIcon 用不了 class）。 */
const CATEGORY_COLOR: Record<TaskCategory, string> = {
  team: "#8b5cf6",
  carpool: "#0ea5e9",
  moving: "#f59e0b",
  volunteer: "#10b981",
  club: "#f43f5e",
  other: "#64748b",
};

const PIN_GLYPH =
  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildPinIcon(task: Task): L.DivIcon {
  const color = CATEGORY_COLOR[task.category] ?? CATEGORY_COLOR.other;
  return L.divIcon({
    className: "task-pin",
    html:
      '<span class="task-pin__halo" style="background:' +
      color +
      '"></span>' +
      '<span class="task-pin__body" style="background:' +
      color +
      '">' +
      PIN_GLYPH +
      "</span>",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

interface PinPoint {
  task: Task;
  coord: LatLng;
}

/** 把委托列表算成点位：优先用发布时保存的坐标，没有就回落地名表。 */
function buildPins(tasks: Task[]): PinPoint[] {
  const seen = new Map<string, number>();
  return tasks.map((task) => {
    const stored = readTaskCoord(task);
    const coord = stored
      ? clampToCampus(stored)
      : resolveTaskCoord(task.location).coord;
    const key = coord.lat.toFixed(4) + ":" + coord.lng.toFixed(4);
    const repeat = seen.get(key) ?? 0;
    seen.set(key, repeat + 1);
    return { task, coord: spreadCoord(coord, repeat) };
  });
}

export function MapCanvas({
  tasks,
  className,
}: {
  tasks: Task[];
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);
  const fittedRef = useRef(false);
  const [ready, setReady] = useState(0);
  const router = useRouter();

  // 建地图：只在挂载时做一次（React StrictMode 会挂两次，清理函数负责收尾）
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const map = L.map(element, {
      center: [CAMPUS_CENTER.lat, CAMPUS_CENTER.lng],
      zoom: CAMPUS_DEFAULT_ZOOM,
      minZoom: 14,
      maxZoom: 19,
      zoomControl: false,
      scrollWheelZoom: false,
    });

    L.tileLayer(activeTile.url, {
      subdomains: activeTile.subdomains,
      maxZoom: activeTile.maxZoom,
      minZoom: 14,
      attribution: activeTile.attribution,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.control.scale({ position: "bottomleft", imperial: false, maxWidth: 100 }).addTo(map);

    mapRef.current = map;
    fittedRef.current = false;
    setReady((value) => value + 1);

    // 首帧容器尺寸可能还没算好，补一次 invalidateSize
    const timer = window.setTimeout(() => map.invalidateSize(), 150);

    return () => {
      window.clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      layersRef.current = [];
      fittedRef.current = false;
    };
  }, []);

  // 画点位：task 变了重建 marker，同时负责首次 fitBounds
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    layersRef.current.forEach((layer) => layer.remove());
    layersRef.current = [];

    const pins = buildPins(tasks);

    pins.forEach(({ task, coord }) => {
      const marker = L.marker([coord.lat, coord.lng], {
        icon: buildPinIcon(task),
        alt: task.title,
        riseOnHover: true,
        riseOffset: 260,
      });

      const statusLabel = statusMeta[task.status]?.label ?? task.status;
      marker.bindTooltip(
        '<div class="task-tip">' +
          '<span class="task-tip__title">' + escapeHtml(task.title) + "</span>" +
          '<span class="task-tip__meta">' +
          escapeHtml(task.location) +
          " · " +
          escapeHtml(statusLabel) +
          "</span>" +
          "</div>",
        {
          className: "task-tip-bubble",
          direction: "top",
          offset: L.point(0, -18),
          opacity: 1,
        }
      );

      marker.on("click", () => {
        router.push("/tasks/" + task.id);
      });

      marker.addTo(map);
      const markerElement = marker.getElement();
      if (markerElement) {
        markerElement.setAttribute(
          "aria-label",
          task.title + "，" + task.location + "，点击查看详情"
        );
      }
      layersRef.current.push(marker);
    });

    if (!fittedRef.current && pins.length > 0) {
      const bounds = L.latLngBounds(pins.map((pin) => [pin.coord.lat, pin.coord.lng]));
      if (pins.length === 1) {
        map.setView(bounds.getCenter(), 17);
      } else {
        map.fitBounds(bounds, { padding: [52, 52], maxZoom: 17 });
      }
      fittedRef.current = true;
    }

    if (pins.length === 0) {
      map.setView([CAMPUS_CENTER.lat, CAMPUS_CENTER.lng], CAMPUS_DEFAULT_ZOOM);
    }
  }, [tasks, ready, router]);

  return <div ref={containerRef} className={className} aria-label="校园互助点位地图" />;
}
