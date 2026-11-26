/**
 * 地图瓦片源配置。
 *
 * 默认走高德栅格瓦片（style=8 是中文注记的街道图），好处是国内加载快、
 * 地名是中文；坐标口径是 GCJ-02，和 campus-places.ts 里的点位坐标一致。
 *
 * 注意：高德栅格瓦片不是官方开放平台接口，课程演示可用，正式上线要换成
 * 申请了 key 的官方服务（高德 JS API / 天地图）。如果演示现场加载不出来，
 * 把 ACTIVE_TILE_SOURCE 改成 "osm" 就能切到 OpenStreetMap（WGS84 口径，
 * 点位会整体偏几十米，但底图能出来）。
 */

export type TileSourceId = "amap" | "osm";

export interface TileSource {
  name: string;
  url: string;
  subdomains?: string[];
  maxZoom: number;
  attribution: string;
}

export const TILE_SOURCES: Record<TileSourceId, TileSource> = {
  amap: {
    name: "高德地图",
    url: "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    subdomains: ["1", "2", "3", "4"],
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.amap.com/" target="_blank" rel="noreferrer">高德地图</a> · GCJ-02',
  },
  osm: {
    name: "OpenStreetMap",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors · WGS84',
  },
};

export const ACTIVE_TILE_SOURCE: TileSourceId = "amap";

export const activeTile = TILE_SOURCES[ACTIVE_TILE_SOURCE];
