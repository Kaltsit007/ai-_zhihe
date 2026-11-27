"use client";

import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./config";

let cached: ReturnType<typeof createBrowserClient> | null = null;

/** 浏览器端 Supabase 客户端；未配置时返回 null，调用方自行降级。 */
export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;
  if (!cached) {
    cached = createBrowserClient(supabaseUrl(), supabaseAnonKey());
  }
  return cached;
}
