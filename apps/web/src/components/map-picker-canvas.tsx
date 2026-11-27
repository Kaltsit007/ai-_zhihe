"use client";

import "leaflet/dist/leaflet.css";
import "./map-canvas.css";
import "./map-picker.css";

import L from "leaflet";
import { useEffect, useRef, useState } from "react";

import {
  CAMPUS_BOUNDS,
  clampToCampus,
  type LatLng,
} from "./campus-places";
import { activeTile } from "./map-tiles";

const PICKER_GLYPH =
  '<span class="picker-pin__ring"></span><span class="picker-pin__dot"></span>';

/** 选点默认视角：落在青春广场—二食堂这一片教学区，别对着镜湖开场。 */
const PICKER_CENTER: LatLng = { lat: 34.2139, lng: 117.1412 };

function buildPickerIcon(): L.DivIcon {
  return L.divIcon({
    className: "picker-pin",
    html: PICKER_GLYPH,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

/**
 * 选点地图：点一下落一个 pin，pin 可以拖。
 * 只负责“选坐标”，存不存得下取决于 Task 有没有 lat/lng（A 的字段）。
 */
export function MapPickerCanvas({
  value,
  onChange,
  heightClass = "h-[240px]",
}: {
  value: LatLng | null;
  onChange: (next: LatLng) => void;
  heightClass?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const [ready, setReady] = useState(0);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const map = L.map(element, {
      center: [PICKER_CENTER.lat, PICKER_CENTER.lng],
      zoom: 16,
      minZoom: 15,
      maxZoom: 19,
      zoomControl: false,
      scrollWheelZoom: false,
      maxBounds: [
        [CAMPUS_BOUNDS.south, CAMPUS_BOUNDS.west],
        [CAMPUS_BOUNDS.north, CAMPUS_BOUNDS.east],
      ],
      maxBoundsViscosity: 0.85,
    });

    L.tileLayer(activeTile.url, {
      subdomains: activeTile.subdomains,
      maxZoom: activeTile.maxZoom,
      minZoom: 15,
      attribution: activeTile.attribution,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    map.on("click", (event: L.LeafletMouseEvent) => {
      onChangeRef.current(clampToCampus({ lat: event.latlng.lat, lng: event.latlng.lng }));
    });

    mapRef.current = map;
    setReady((count) => count + 1);

    const timer = window.setTimeout(() => map.invalidateSize(), 150);

    return () => {
      window.clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // 同步外部传进来的坐标：没值就摘掉 pin，有值就放上去 / 移动
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!value) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    if (!markerRef.current) {
      const marker = L.marker([value.lat, value.lng], {
        icon: buildPickerIcon(),
        draggable: true,
        keyboard: false,
        alt: "已选位置，可拖动调整",
        zIndexOffset: 400,
      });
      marker.on("dragend", () => {
        const point = marker.getLatLng();
        onChangeRef.current(clampToCampus({ lat: point.lat, lng: point.lng }));
      });
      marker.addTo(map);
      markerRef.current = marker;
    } else {
      markerRef.current.setLatLng([value.lat, value.lng]);
    }

    if (!map.getBounds().contains([value.lat, value.lng])) {
      map.panTo([value.lat, value.lng]);
    }
  }, [value, ready]);

  return (
    <div
      ref={containerRef}
      className={"leaflet-map map-picker " + heightClass}
      aria-label="地图选点，点击地图选择委托位置"
    />
  );
}
