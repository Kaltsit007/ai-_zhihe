/**
 * 校园地点坐标表（GCJ-02，与高德瓦片同口径）。
 *
 * Task 从 D3 起支持可选的 lat/lng（发布页选点写入）。没有坐标的旧委托
 * 仍按 location 文本在这里匹配；匹配不到就落一个稳定的小偏移，页面不空白。
 *
 * D3 校正：图书馆、博学楼、二食堂（松苑）、一食堂（桃苑）、体育馆、竹园、
 * 青春广场、南门、明德礼堂都按高德 POI / 底图地标重新对过（GCJ-02）；
 * 大学生活动中心没有独立 POI，按行健西路与青春广场的相对位置估，误差百米内。
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/** 教学区中心（青春广场—博学楼一带），没有匹配到地名时用它兜底。 */
export const CAMPUS_CENTER: LatLng = { lat: 34.2138, lng: 117.141 };
export const CAMPUS_DEFAULT_ZOOM = 16;

interface PlaceEntry {
  /** 展示名，选点面板的快捷按钮用它。 */
  name: string;
  /** 地名关键词，命中任意一个就算匹配。 */
  keywords: string[];
  coord: LatLng;
}

const PLACES: PlaceEntry[] = [
  { name: "图书馆", keywords: ["图书馆"], coord: { lat: 34.215223, lng: 117.144908 } },
  { name: "博学楼", keywords: ["博学楼", "博学"], coord: { lat: 34.213634, lng: 117.144014 } },
  {
    name: "二食堂",
    keywords: ["二食堂", "松苑餐厅", "U1818", "美食广场"],
    coord: { lat: 34.213515, lng: 117.139494 },
  },
  { name: "一食堂", keywords: ["一食堂", "桃苑餐厅"], coord: { lat: 34.215189, lng: 117.141584 } },
  { name: "体育馆", keywords: ["体育馆", "羽毛球馆"], coord: { lat: 34.2198, lng: 117.143612 } },
  { name: "竹园宿舍", keywords: ["竹园", "竹苑"], coord: { lat: 34.212338, lng: 117.139424 } },
  { name: "大学生活动中心", keywords: ["活动中心", "大活"], coord: { lat: 34.2142, lng: 117.1408 } },
  { name: "南门", keywords: ["南门"], coord: { lat: 34.20782, lng: 117.1401 } },
  { name: "青春广场", keywords: ["青春广场"], coord: { lat: 34.213485, lng: 117.140026 } },
  { name: "明德礼堂", keywords: ["明德礼堂"], coord: { lat: 34.207949, lng: 117.141719 } },
];

/** 选点面板用的地点清单，展示名 + 坐标。 */
export const CAMPUS_PLACES: { name: string; coord: LatLng }[] = PLACES.map((place) => ({
  name: place.name,
  coord: place.coord,
}));

/** 校区可点范围，选点时限制在这块里，防止点到校外。 */
export const CAMPUS_BOUNDS = {
  south: 34.2045,
  north: 34.2248,
  west: 117.1315,
  east: 117.1545,
};

export function isInsideCampus(coord: LatLng): boolean {
  return (
    coord.lat >= CAMPUS_BOUNDS.south &&
    coord.lat <= CAMPUS_BOUNDS.north &&
    coord.lng >= CAMPUS_BOUNDS.west &&
    coord.lng <= CAMPUS_BOUNDS.east
  );
}

/** 把坐标夹回校区范围内，防止拖到校外。 */
export function clampToCampus(coord: LatLng): LatLng {
  return {
    lat: Math.min(Math.max(coord.lat, CAMPUS_BOUNDS.south), CAMPUS_BOUNDS.north),
    lng: Math.min(Math.max(coord.lng, CAMPUS_BOUNDS.west), CAMPUS_BOUNDS.east),
  };
}

/**
 * 从委托对象里读坐标。
 * 优先用发布时保存的 lat/lng；旧数据没有这两个字段时返回 null，
 * 调用方回落地名坐标表。
 */
export function readTaskCoord(input: unknown): LatLng | null {
  if (!input || typeof input !== "object") return null;
  const record = input as { lat?: unknown; lng?: unknown };
  const lat = typeof record.lat === "number" ? record.lat : Number(record.lat);
  const lng = typeof record.lng === "number" ? record.lng : Number(record.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null;
  return { lat, lng };
}

/**
 * 把自由文本的地点解析成坐标。
 * 匹配不到时在校区中心附近做一个稳定的微小偏移，避免所有未知地点叠成一点。
 */
export function resolveTaskCoord(location: string): {
  coord: LatLng;
  matched: boolean;
} {
  const text = (location || "").replace(/\s+/g, "");
  for (const place of PLACES) {
    if (place.keywords.some((keyword) => text.includes(keyword))) {
      return { coord: place.coord, matched: true };
    }
  }
  return { coord: jitterAroundCenter(location), matched: false };
}

/** 同一个地点有多条委托时，给它们错开一点点，避免 pin 完全重合。 */
export function spreadCoord(coord: LatLng, index: number): LatLng {
  if (index === 0) return coord;
  const angle = (index * 137.5 * Math.PI) / 180;
  const radius = 0.00035 * index;
  return {
    lat: coord.lat + Math.sin(angle) * radius,
    lng: coord.lng + Math.cos(angle) * radius,
  };
}

function jitterAroundCenter(seed: string): LatLng {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  }
  const offsetLat = ((hash % 7) - 3) * 0.0006;
  const offsetLng = ((hash % 5) - 2) * 0.0008;
  return {
    lat: CAMPUS_CENTER.lat + offsetLat,
    lng: CAMPUS_CENTER.lng + offsetLng,
  };
}
