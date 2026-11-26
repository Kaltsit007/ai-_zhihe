/**
 * 校园地点坐标表（GCJ-02，与高德瓦片同口径）。
 *
 * 为什么要有这张表：Task 里现在只有 location 文本（"图书馆一楼讨论区"），
 * 没有经纬度字段。真地图需要坐标，而改 Task 类型和 mock-data 属于 A 的领地，
 * 所以 D2 先在前端做一层“地名 → 坐标”的映射，页面和接口契约都不动。
 *
 * 图书馆、博学楼、二食堂、体育馆、青春广场的坐标来自公开 POI，其余几个
 * （南门、一食堂、竹园宿舍、大学生活动中心）按校区相对位置估算，D3 拍
 * 真实坐标时统一替换。全校区视觉上误差几十米，演示够用。
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/** 南湖校区中心，用于没有匹配到地名时的兜底视角。 */
export const CAMPUS_CENTER: LatLng = { lat: 34.2158, lng: 117.1422 };
export const CAMPUS_DEFAULT_ZOOM = 16;

interface PlaceEntry {
  /** 地名关键词，命中任意一个就算匹配。 */
  keywords: string[];
  coord: LatLng;
}

const PLACES: PlaceEntry[] = [
  { keywords: ["图书馆"], coord: { lat: 34.215223, lng: 117.144908 } },
  { keywords: ["博学楼", "博学"], coord: { lat: 34.213634, lng: 117.144014 } },
  {
    keywords: ["二食堂", "松苑餐厅", "U1818", "美食广场"],
    coord: { lat: 34.213565, lng: 117.13935 },
  },
  { keywords: ["一食堂", "桃苑餐厅"], coord: { lat: 34.2146, lng: 117.1384 } },
  { keywords: ["体育馆", "羽毛球馆"], coord: { lat: 34.2198, lng: 117.143612 } },
  { keywords: ["竹园", "竹苑"], coord: { lat: 34.2123, lng: 117.1389 } },
  { keywords: ["活动中心", "大活"], coord: { lat: 34.2142, lng: 117.1408 } },
  { keywords: ["南门"], coord: { lat: 34.2098, lng: 117.1426 } },
  { keywords: ["青春广场"], coord: { lat: 34.213485, lng: 117.140026 } },
  { keywords: ["明德礼堂"], coord: { lat: 34.2148, lng: 117.1416 } },
];

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
